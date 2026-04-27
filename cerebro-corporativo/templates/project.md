---
title: 
created: 
updated: 
type: project
status: discovery
priority: P2
horizon: short
owner_role: ic
sponsor: 
team: []
stakeholders: []
projects_related: []
dependencies: []
blocks: []
areas: []
start_date: 
target_date: 
next_milestone: 
next_milestone_date: 
budget: 
tags: [project]
---

<!--
INSTRUÇÕES (apague este bloco no arquivo final):
- status: discovery | planning | in-progress | blocked | review | completed | archived
- priority: P0 (crítico) | P1 (alto) | P2 (médio) | P3 (baixo)
- horizon: short (até 3m) | medium (3-9m) | long (estratégico)
- owner_role: ic | tech-lead | sponsor | shadow
- sponsor, stakeholders, projects_related, dependencies, blocks: usar wikilinks como [[nome-do-arquivo]]
- areas: wikilinks para [[10-areas/nome]]
- Substitua datas vazias pela data real (YYYY-MM-DD)
-->

# [Nome do Projeto]

## Por que existe (north star)

> Em uma frase: por que esse projeto importa para a empresa? Quem ganha o quê?

## Escopo

### Dentro
- 

### Fora (explicitamente)
- 

## Stakeholders e papéis

| Pessoa | Papel no projeto | Expectativa |
|--------|------------------|-------------|
| [[]] | sponsor | |
| [[]] | aprovador | |
| [[]] | usuário | |

## Marcos

- [ ] **M1:** YYYY-MM-DD — descrição
- [ ] **M2:** YYYY-MM-DD — descrição
- [ ] **M3:** YYYY-MM-DD — descrição

## Estado atual

_Atualizar a cada update do projeto._

## Riscos e blockers

| Risco | Probabilidade | Impacto | Mitigação | Owner |
|-------|---------------|---------|-----------|-------|
| | | | | |

## Conexões com outros projetos

> Como este projeto conversa com outros do portfólio?

## Decisões relevantes

```dataview
LIST
FROM "60-decisions"
WHERE contains(projects, this.file.link)
```

## Reuniões deste projeto

```dataview
TABLE date, meeting_type AS "Tipo"
FROM "50-meetings"
WHERE contains(projects, this.file.link)
SORT date DESC
LIMIT 10
```

## Aprendizados

> Atualizar ao final de cada fase ou quando algo importante for aprendido.

## Changelog

- YYYY-MM-DD: criação da nota
