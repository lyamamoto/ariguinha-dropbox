---
title: 
created: 
updated: 
type: stakeholder
relation: peer
role: 
area: 
seniority: 
location: 
relationship_started: 
last_interaction: 
interaction_frequency: monthly
health: neutral
power: medium
alignment: neutral
archived: false
tags: [stakeholder]
---

<!--
INSTRUÇÕES (apague este bloco no arquivo final):
- relation: manager | skip-level | skip-skip | peer | direct-report | internal-client | cross-functional | external
- interaction_frequency: weekly | biweekly | monthly | quarterly | sporadic
- health: strong | positive | neutral | tense | broken
- power: high | medium | low
- alignment: aligned | neutral | misaligned | unknown
- CAMPOS POLÍTICOS NUNCA INFERIDOS POR DEVIN — só preencher com valor explícito
-->

# [Nome]

> ⚠️ Conteúdo sensível. Não compartilhar.

## Perfil profissional

- **Cargo atual:** 
- **Área / time:** 
- **Reporta a:** [[]]
- **Tempo de empresa:** 
- **Background relevante:** 

## Como trabalha

- **Estilo de comunicação:** 
- **Como prefere ser abordado:** 
- **Decision-making style:** 
- **Pontos fortes percebidos:** 
- **Limitações percebidas:** 

## Interesses e motivadores

- **O que quer alcançar profissionalmente:** 
- **Métricas pelas quais é avaliado(a):** 
- **Pet topics / bandeiras pessoais:** 
- **O que evita / não tolera:** 

## Leitura política (privada)

- **Aliados conhecidos:** [[]], [[]]
- **Tensões conhecidas:** [[]]
- **Capital político atual:** 
- **Áreas de influência:** 
- **Como é percebido(a) no nível acima:** 

## Minha relação

- **Como nos conhecemos:** 
- **Histórico:** 
- **Onde estou útil para ele(a):** 
- **Onde ele(a) é útil para mim:** 
- **Riscos:** 
- **Oportunidades de fortalecer:** 

## Projetos compartilhados

```dataview
LIST
FROM "20-projects"
WHERE contains(stakeholders, this.file.link) OR contains(team, this.file.link) OR sponsor = this.file.link
```

## Reuniões com esta pessoa

```dataview
TABLE date, meeting_type AS "Tipo", projects
FROM "50-meetings"
WHERE contains(participants, this.file.link)
SORT date DESC
LIMIT 10
```

## Log de interações relevantes

> Mais recente no topo. Só registre interações que dizem algo sobre a relação ou posição.

### YYYY-MM-DD — _(contexto curto)_
- 

## Ações pendentes

- [ ]
