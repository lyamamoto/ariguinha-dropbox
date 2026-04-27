---
title: Áreas
created: 2026-04-27
updated: 2026-04-27
tags: [index, areas]
---

# 🏛️ Áreas de Responsabilidade

Áreas **não terminam**. São responsabilidades contínuas que demandam atenção recorrente.

## Status atual

```dataview
TABLE cadence AS "Cadência", last_review AS "Última revisão", next_review AS "Próxima", health
FROM "10-areas"
SORT health ASC, last_review ASC
```

## Áreas em alerta (health amarelo ou vermelho)

```dataview
LIST
FROM "10-areas"
WHERE health = "yellow" OR health = "red"
```

## Áreas atrasadas para revisão

```dataview
TABLE next_review AS "Era para revisar"
FROM "10-areas"
WHERE next_review AND date(next_review) < date(today)
```

## Áreas típicas em ambiente corporativo

Sugestões para popular esta pasta conforme aplicável ao seu papel:

- Gestão de time / pessoas
- Saúde do produto / KPIs principais
- Relacionamento com cliente interno
- Qualidade técnica / dívida
- Compliance / governança
- Orçamento da área
- Comunicação institucional
- Desenvolvimento próprio
