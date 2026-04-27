---
title: Decisões
created: 2026-04-27
updated: 2026-04-27
tags: [index, decisions]
---

# ⚖️ Decisões

ADRs adaptados para decisões de negócio, técnicas e organizacionais.

## Aceitas

```dataview
TABLE date AS "Data", scope AS "Escopo", decision_owner AS "Responsável"
FROM "60-decisions"
WHERE status = "accepted"
SORT date DESC
```

## Em proposta / discussão

```dataview
TABLE created AS "Aberto em", scope, proposed_by AS "Proposto por"
FROM "60-decisions"
WHERE status = "proposed"
SORT created DESC
```

## Antigas em proposta (atenção: decidir ou descartar)

```dataview
TABLE created AS "Aberto há", scope
FROM "60-decisions"
WHERE status = "proposed" AND date(created) < date(today) - dur(30 days)
SORT created ASC
```

## Superadas (mantidas para histórico)

```dataview
TABLE date AS "Data", superseded_by AS "Substituída por"
FROM "60-decisions"
WHERE status = "superseded"
SORT date DESC
```

## Rejeitadas

```dataview
TABLE date AS "Data", scope
FROM "60-decisions"
WHERE status = "rejected"
SORT date DESC
```

## Por escopo

### Decisões técnicas
```dataview
LIST
FROM "60-decisions"
WHERE scope = "technical"
SORT date DESC
LIMIT 10
```

### Decisões de produto
```dataview
LIST
FROM "60-decisions"
WHERE scope = "product"
SORT date DESC
LIMIT 10
```

### Decisões organizacionais
```dataview
LIST
FROM "60-decisions"
WHERE scope = "org"
SORT date DESC
LIMIT 10
```
