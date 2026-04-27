---
title: Reuniões
created: 2026-04-27
updated: 2026-04-27
tags: [index, meetings]
---

# 🗣️ Reuniões

## Últimas 4 semanas

```dataview
TABLE meeting_type AS "Tipo", participants AS "Participantes", projects AS "Projetos"
FROM "50-meetings"
WHERE date >= date(today) - dur(28 days)
SORT date DESC
```

## Por tipo (totais)

```dataview
TABLE WITHOUT ID meeting_type AS "Tipo", length(rows) AS "Quantidade"
FROM "50-meetings"
GROUP BY meeting_type
SORT length(rows) DESC
```

## Recorrentes (manual — atualizar quando mudar)

| Reunião | Cadência | Participantes principais |
|---------|----------|--------------------------|
| 1:1 com gestor | semanal | [[exemplo-gestor-direto]] |
| Comitê de produto | quinzenal | _(preencher)_ |
| Skip-level | trimestral | [[exemplo-skip-level]] |
| All-hands da área | mensal | _(preencher)_ |

## 1:1s do último trimestre

```dataview
TABLE participants
FROM "50-meetings"
WHERE meeting_type = "1on1" AND date >= date(today) - dur(90 days)
SORT date DESC
```

## Comitês

```dataview
TABLE date, participants
FROM "50-meetings"
WHERE meeting_type = "committee"
SORT date DESC
LIMIT 20
```
