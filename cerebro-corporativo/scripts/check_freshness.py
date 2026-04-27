#!/usr/bin/env python3
"""
check_freshness.py — encontra notas paradas há muito tempo.

Uso:
    python3 scripts/check_freshness.py stakeholders [dias]   # default 60
    python3 scripts/check_freshness.py projects [dias]       # default 14
    python3 scripts/check_freshness.py adrs [dias]           # default 30 (apenas proposed)
"""

import sys
from pathlib import Path
from datetime import date, datetime
import re

ROOT = Path(__file__).parent.parent
FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---', re.DOTALL)

def parse_fm(text):
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).split('\n'):
        if ':' in line and not line.startswith(' ') and not line.startswith('-'):
            k, _, v = line.partition(':')
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm

def days_since(s):
    try:
        return (date.today() - datetime.fromisoformat(str(s)).date()).days
    except Exception:
        return None

def check_stakeholders(threshold):
    folder = ROOT / "30-stakeholders"
    stale = []
    for f in folder.rglob("*.md"):
        if f.name == "README.md":
            continue
        fm = parse_fm(f.read_text(encoding='utf-8'))
        if fm.get('archived', '').lower() == 'true':
            continue
        last = fm.get('last_interaction', '')
        d = days_since(last)
        if d is None:
            stale.append((f, "sem last_interaction"))
        elif d > threshold:
            stale.append((f, f"{d} dias sem interação"))
    return stale

def check_projects(threshold):
    folder = ROOT / "20-projects"
    stale = []
    for f in folder.rglob("*.md"):
        if f.name == "README.md":
            continue
        fm = parse_fm(f.read_text(encoding='utf-8'))
        status = fm.get('status', '')
        if status in ('archived', 'completed'):
            continue
        upd = fm.get('updated', '')
        d = days_since(upd)
        if d is None:
            stale.append((f, "sem updated"))
        elif d > threshold:
            stale.append((f, f"{d} dias sem update (status={status})"))
    return stale

def check_adrs(threshold):
    folder = ROOT / "60-decisions"
    stale = []
    if not folder.exists():
        return stale
    for f in folder.rglob("*.md"):
        if f.name == "README.md":
            continue
        fm = parse_fm(f.read_text(encoding='utf-8'))
        if fm.get('status', '') != 'proposed':
            continue
        d = days_since(fm.get('created', ''))
        if d is not None and d > threshold:
            stale.append((f, f"proposed há {d} dias"))
    return stale

CHECKS = {
    'stakeholders': (check_stakeholders, 60),
    'projects': (check_projects, 14),
    'adrs': (check_adrs, 30),
}

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    target = sys.argv[1]
    if target not in CHECKS:
        print(f"Alvo inválido. Use: {', '.join(CHECKS)}")
        return 1
    fn, default = CHECKS[target]
    threshold = int(sys.argv[2]) if len(sys.argv) > 2 else default
    stale = fn(threshold)
    if not stale:
        print(f"✅ Nenhum item de '{target}' acima de {threshold} dias.")
        return 0
    print(f"⚠️  {len(stale)} item(s) de '{target}' acima de {threshold} dias:\n")
    for f, reason in stale:
        print(f"  - {f.relative_to(ROOT)} — {reason}")
    return 1

if __name__ == '__main__':
    sys.exit(main())
