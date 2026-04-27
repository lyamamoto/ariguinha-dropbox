#!/usr/bin/env python3
"""
validate_links.py — encontra wikilinks e markdown links quebrados no vault.

Uso:
    python3 scripts/validate_links.py

Exit 0 se tudo OK, exit 1 se houver links quebrados.
Ignora pastas: templates/, 80-archive/, scripts/, .obsidian/, .devin/, 70-career/, docs/
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent.parent
WIKILINK_RE = re.compile(r'\[\[([^\]\|]+?)(?:\|[^\]]+?)?\]\]')
MD_LINK_RE = re.compile(r'\[([^\]]+)\]\(([^)]+\.md)(?:#[^)]*)?\)')

IGNORE_DIRS = {'templates', '80-archive', 'scripts', 'docs', '70-career'}
IGNORE_HIDDEN = True

def collect_md_files():
    files = {}
    for p in ROOT.rglob("*.md"):
        if IGNORE_HIDDEN and any(part.startswith('.') for part in p.parts):
            continue
        files.setdefault(p.stem, set()).add(p)
    return files

def is_ignored(p):
    return (any(part in IGNORE_DIRS for part in p.parts) or
            (IGNORE_HIDDEN and any(part.startswith('.') for part in p.parts)))

def validate_wikilinks(content, all_files):
    broken = []
    for match in WIKILINK_RE.finditer(content):
        target = match.group(1).strip().split('#')[0].split('/')[-1].strip()
        if not target:
            continue
        if target not in all_files:
            broken.append(('wikilink', match.group(0), target))
    return broken

def validate_md_links(content, source, all_files):
    broken = []
    source_dir = source.parent
    for match in MD_LINK_RE.finditer(content):
        text, target = match.group(1), match.group(2)
        if target.startswith(('http://', 'https://', 'mailto:')):
            continue
        target_path = (source_dir / target).resolve()
        try:
            target_path.relative_to(ROOT.resolve())
        except ValueError:
            continue
        if not target_path.exists():
            broken.append(('md-link', match.group(0), str(target_path.relative_to(ROOT.resolve()))))
    return broken

def main():
    all_files = collect_md_files()
    issues = defaultdict(list)
    md_files = [p for p in ROOT.rglob("*.md") if not is_ignored(p)]

    for f in md_files:
        try:
            content = f.read_text(encoding='utf-8')
        except Exception as e:
            print(f"⚠️  erro ao ler {f}: {e}")
            continue
        broken = validate_wikilinks(content, all_files) + validate_md_links(content, f, all_files)
        if broken:
            issues[f.relative_to(ROOT)] = broken

    if not issues:
        print("✅ Todos os links estão válidos.")
        return 0

    print(f"❌ {sum(len(v) for v in issues.values())} link(s) quebrado(s) em {len(issues)} arquivo(s):\n")
    for f, broken_list in sorted(issues.items()):
        print(f"📄 {f}")
        for kind, raw, target in broken_list:
            print(f"   - [{kind}] {raw}  →  alvo não encontrado: {target}")
        print()
    return 1

if __name__ == '__main__':
    sys.exit(main())
