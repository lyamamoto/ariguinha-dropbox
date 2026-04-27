---
title: YYYY-Www
created: 
type: weekly
week: 
year: 
tags: [weekly, review]
---

# Weekly Review — Semana WW de YYYY

> Período: YYYY-MM-DD a YYYY-MM-DD

## Resumo executivo

> 3 linhas: o que aconteceu de mais importante esta semana?

## Reuniões realizadas

```dataview
TABLE meeting_type AS "Tipo", participants
FROM "50-meetings"
WHERE date >= date(YYYY-MM-DD) AND date <= date(YYYY-MM-DD)
SORT date ASC
```

## Decisões tomadas

```dataview
TABLE status, scope
FROM "60-decisions"
WHERE date(updated) >= date(YYYY-MM-DD) AND date(updated) <= date(YYYY-MM-DD)
SORT updated ASC
```

## Progresso por projeto ativo

```dataview
TABLE status, next_milestone, next_milestone_date
FROM "20-projects"
WHERE date(updated) >= date(YYYY-MM-DD) AND status != "completed" AND status != "archived"
SORT priority ASC
```

## Action items abertos do dono

> Devin: varrer os daily da semana e listar tarefas não concluídas que mencionam "(eu)".

- [ ] 
- [ ] 

## Stakeholders com interações na semana

```dataview
LIST role
FROM "30-stakeholders"
WHERE date(last_interaction) >= date(YYYY-MM-DD) AND date(last_interaction) <= date(YYYY-MM-DD)
```

## Sinais de atenção

### Stakeholders frios há mais de 60 dias
> _(preencher manualmente ou via `python3 scripts/check_freshness.py stakeholders 60`)_

### Projetos sem update há mais de 14 dias
> _(idem `python3 scripts/check_freshness.py projects 14`)_

### ADRs em proposta há mais de 30 dias
> _(idem `python3 scripts/check_freshness.py adrs 30`)_

## Reflexão

> O que funcionou esta semana? O que travou? Que padrão observei?

## Foco da próxima semana

1. 
2. 
3.
