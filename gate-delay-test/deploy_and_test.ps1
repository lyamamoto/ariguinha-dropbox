# ──────────────────────────────────────────────────────────────────────
# Gate.io Latency Test - Multi-Region AWS Deployment (PowerShell)
#
# Deploys t3.micro spot instances in each region, runs the test,
# collects results, and terminates. Cost estimate: ~$0.02-0.05 total.
#
# Prerequisites:
#   - AWS CLI configured (aws configure)
#   - SSH client available (OpenSSH comes with Windows 10+)
#   - Default VPC with public subnet in each region
#
# Usage:
#   .\deploy_and_test.ps1
#
# With order testing:
#   $env:GATE_API_KEY="xxx"; $env:GATE_API_SECRET="yyy"; .\deploy_and_test.ps1
# ──────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

$Regions = @("sa-east-1", "us-east-1", "ap-northeast-1", "ap-southeast-1")
$KeyName = "gate-latency-test"
$InstanceType = "t3.micro"
$Samples = 100
$Pair = "BTC_USDT"
$ResultsDir = "results"
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")

$InstanceIds = @{}
$PublicIps = @{}

New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

function Log($msg) {
    $ts = (Get-Date).ToUniversalTime().ToString("HH:mm:ss")
    Write-Host "[$ts] $msg"
}

# ─── Get latest Amazon Linux 2023 AMI for a region ───────────────────
function Get-Ami($region) {
    $ami = (aws ec2 describe-images `
        --region $region `
        --owners amazon `
        --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" `
        --query 'sort_by(Images, &CreationDate)[-1].ImageId' `
        --output text) | Select-Object -First 1
    return $ami
}

# ─── Ensure key pair exists in region ─────────────────────────────────
function Ensure-Key($region) {
    $keyFile = "$ResultsDir\$KeyName-$region.pem"

    if (Test-Path $keyFile) {
        Log "Key $keyFile already exists"
        return
    }

    # Delete remote key if exists (might be orphaned)
    aws ec2 delete-key-pair --region $region --key-name $KeyName 2>$null | Out-Null

    aws ec2 create-key-pair `
        --region $region `
        --key-name $KeyName `
        --query 'KeyMaterial' `
        --output text | Out-File -Encoding ascii -FilePath $keyFile

    Log "Created key pair in $region"
}

# ─── Ensure security group allows SSH ─────────────────────────────────
function Ensure-SG($region) {
    $sgName = "gate-latency-test-sg"

    $sgId = (aws ec2 describe-security-groups `
        --region $region `
        --filters "Name=group-name,Values=$sgName" `
        --query 'SecurityGroups[0].GroupId' `
        --output text 2>$null) | Select-Object -First 1

    if (-not $sgId -or $sgId -eq "None" -or $sgId -eq "null") {
        $sgId = (aws ec2 create-security-group `
            --region $region `
            --group-name $sgName `
            --description "Gate.io latency test - SSH access" `
            --query 'GroupId' `
            --output text) | Select-Object -First 1

        aws ec2 authorize-security-group-ingress `
            --region $region `
            --group-id $sgId `
            --protocol tcp `
            --port 22 `
            --cidr "0.0.0.0/0" | Out-Null

        Log "Created security group $sgId in $region"
    } else {
        Log "Security group $sgId exists in $region"
    }

    return $sgId
}

# ─── User data script (base64 encoded for Windows) ───────────────────
function Get-UserData {
    $script = @"
#!/bin/bash
set -ex
dnf install -y python3.11 python3.11-pip chrony
systemctl enable --now chronyd
chronyc makestep
pip3.11 install websockets aiohttp numpy
"@
    return [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($script))
}

# ─── Launch instance in a region ──────────────────────────────────────
function Launch-Instance($region) {
    Log "[$region] Resolving AMI..."
    $ami = Get-Ami $region
    Log "[$region] AMI: $ami"

    Ensure-Key $region
    $sgId = Ensure-SG $region
    Log "[$region] Security Group: '$sgId'"

    if (-not $sgId -or $sgId -eq "None" -or $sgId -eq "null") {
        throw "[$region] Failed to resolve security group"
    }

    $userData = Get-UserData
    $spotOptions = '{"MarketType":"spot","SpotOptions":{"SpotInstanceType":"one-time"}}'
    $tags = 'ResourceType=instance,Tags=[{Key=Name,Value=gate-latency-test},{Key=AutoTerminate,Value=true}]'

    Log "[$region] Launching $InstanceType spot instance..."
    $instanceId = (aws ec2 run-instances `
        --region $region `
        --image-id $ami `
        --instance-type $InstanceType `
        --key-name $KeyName `
        --security-group-ids $sgId `
        --instance-market-options $spotOptions `
        --user-data $userData `
        --tag-specifications $tags `
        --query 'Instances[0].InstanceId' `
        --output text) | Select-Object -First 1

    if (-not $instanceId) {
        throw "[$region] Failed to launch instance (empty instance ID). Check SG=$sgId AMI=$ami"
    }

    $script:InstanceIds[$region] = $instanceId
    Log "[$region] Instance: $instanceId"
}

# ─── Wait for instance and get IP ────────────────────────────────────
function Wait-ForInstance($region) {
    $instanceId = $script:InstanceIds[$region]

    Log "[$region] Waiting for instance $instanceId to be running..."
    aws ec2 wait instance-running --region $region --instance-ids $instanceId | Out-Null

    $ip = (aws ec2 describe-instances `
        --region $region `
        --instance-ids $instanceId `
        --query 'Reservations[0].Instances[0].PublicIpAddress' `
        --output text) | Select-Object -First 1

    $script:PublicIps[$region] = $ip
    Log "[$region] Public IP: $ip"
}

# ─── Run test on remote instance ──────────────────────────────────────
function Run-RemoteTest($region) {
    $ip = $script:PublicIps[$region]
    $keyFile = Resolve-Path "$ResultsDir\$KeyName-$region.pem"
    $sshOpts = @(
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "-o", "ConnectTimeout=15",
        "-o", "ServerAliveInterval=30",
        "-o", "BatchMode=yes"
    )
    $scpOpts = @(
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "-o", "ConnectTimeout=15",
        "-o", "BatchMode=yes"
    )
    $remoteOutput = "/tmp/results_$region.json"
    $localOutput = "$ResultsDir\${Timestamp}_$region.json"

    # Wait for SSH + user-data to finish (python3.11 installed)
    Log "[$region] Waiting for SSH readiness (ip=$ip)..."
    $ready = $false
    for ($i = 1; $i -le 30; $i++) {
        Log "[$region]   attempt $i/30..."
        ssh @sshOpts -i $keyFile "ec2-user@$ip" "test -f /usr/bin/python3.11" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            Log "[$region]   SSH ready!"
            break
        }
        Start-Sleep -Seconds 10
    }

    if (-not $ready) {
        Log "[$region] SSH never became ready after 30 attempts, skipping"
        return
    }

    # Upload test script (use absolute path)
    $scriptPath = Resolve-Path "latency_test.py"
    Log "[$region] Uploading $scriptPath..."
    scp @scpOpts -i $keyFile "$scriptPath" "ec2-user@${ip}:/tmp/"
    if ($LASTEXITCODE -ne 0) {
        Log "[$region] SCP upload failed (exit=$LASTEXITCODE), skipping"
        return
    }

    # Build remote command
    $remoteCmd = "cd /tmp && python3.11 latency_test.py --pair $Pair --samples $Samples --output $remoteOutput"
    if ($env:GATE_API_KEY) {
        $remoteCmd = "GATE_API_KEY='$($env:GATE_API_KEY)' GATE_API_SECRET='$($env:GATE_API_SECRET)' $remoteCmd"
    }

    # Run test
    Log "[$region] Running latency test..."
    ssh @sshOpts -i $keyFile "ec2-user@$ip" $remoteCmd
    if ($LASTEXITCODE -ne 0) {
        Log "[$region] Remote test failed (exit=$LASTEXITCODE)"
    }

    # Download results
    scp @scpOpts -i $keyFile "ec2-user@${ip}:$remoteOutput" $localOutput
    if ($LASTEXITCODE -eq 0) {
        Log "[$region] Results saved to $localOutput"
    } else {
        Log "[$region] Failed to download results (exit=$LASTEXITCODE)"
    }
}

# ─── Terminate instance ──────────────────────────────────────────────
function Terminate-Instance($region) {
    $instanceId = $script:InstanceIds[$region]
    if ($instanceId) {
        Log "[$region] Terminating $instanceId..."
        aws ec2 terminate-instances --region $region --instance-ids $instanceId 2>$null | Out-Null
    }
}

# ─── Cleanup all resources ───────────────────────────────────────────
function Cleanup-All {
    Log "Cleaning up all instances..."
    foreach ($region in $Regions) {
        try { Terminate-Instance $region } catch { }
    }
}

# ─── Main ─────────────────────────────────────────────────────────────
try {
    Log "Starting Gate.io multi-region latency test"
    Log "Regions: $($Regions -join ', ')"
    Log "Instance type: $InstanceType (spot)"
    Log "Samples: $Samples | Pair: $Pair"
    Write-Host "================================================================"

    # Phase 1: Launch all instances (sequential - AWS CLI doesn't parallelize well in PS)
    foreach ($region in $Regions) {
        Launch-Instance $region
    }
    Log "All instances launched"

    # Phase 2: Wait for all instances
    foreach ($region in $Regions) {
        Wait-ForInstance $region
    }
    Log "All instances ready"

    # Phase 3: Run tests sequentially (reliable, ~5min each)
    foreach ($region in $Regions) {
        try {
            Run-RemoteTest $region
        } catch {
            Log "[$region] TEST FAILED: $_"
        }
    }

    Log "All tests complete"

} finally {
    # Phase 4: Always cleanup
    Cleanup-All
}

Write-Host "================================================================"
Log "All results in $ResultsDir\"
Log "Run: python compare_results.py"
