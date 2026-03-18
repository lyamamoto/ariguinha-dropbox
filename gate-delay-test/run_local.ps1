# Run the latency test from your local machine
# Usage:
#   .\run_local.ps1
#
# With order testing:
#   $env:GATE_API_KEY="xxx"; $env:GATE_API_SECRET="yyy"; .\run_local.ps1

$ErrorActionPreference = "Stop"

$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$Output = "results\${Timestamp}_local.json"

New-Item -ItemType Directory -Force -Path "results" | Out-Null

$Args = @("--pair", "BTC_USDT", "--samples", "100", "--output", $Output)

if ($env:GATE_API_KEY) {
    $Args += @("--api-key", $env:GATE_API_KEY, "--api-secret", $env:GATE_API_SECRET)
}

python latency_test.py @Args

Write-Host ""
Write-Host "Results saved to $Output"
Write-Host "To compare all results: python compare_results.py"
