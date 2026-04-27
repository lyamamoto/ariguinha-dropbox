---
title: Stakeholders
created: 2026-04-27
updated: 2026-04-27
tags: [index, stakeholders]
---

# 👥 Stakeholders

> ⚠️ Conteúdo sensível em arquivos individuais. Este índice mostra apenas dados objetivos.

## Por relação hierárquica

### Acima (gestor + skip-levels)

```dataview
TABLE role AS "Cargo", last_interaction AS "Última interação", interaction_frequency AS "Frequência", health
FROM "30-stakeholders"
WHERE archived != true AND (relation = "manager" OR relation = "skip-level" OR relation = "skip-skip")
SORT relation ASC
```

### Pares

```dataview
TABLE role AS "Cargo", area AS "Área", last_interaction AS "Última interação"
FROM "30-stakeholders"
WHERE archived != true AND relation = "peer"
SORT last_interaction DESC
```

### Reportes diretos

```dataview
TABLE role AS "Cargo", last_interaction AS "Última 1:1", health
FROM "30-stakeholders"
WHERE archived != true AND relation = "direct-report"
```

### Clientes internos / cross-funcional / externos

```dataview
TABLE relation AS "Tipo", role AS "Cargo", area AS "Área", last_interaction
FROM "30-stakeholders"
WHERE archived != true AND (relation = "internal-client" OR relation = "cross-functional" OR relation = "external")
SORT relation ASC
```

## Quadrante poder × alinhamento

> Use para priorizar tempo de relacionamento. Atualizar trimestralmente.

| | Alinhado | Neutro | Desalinhado |
|---|---|---|---|
| **Alto poder** | Cultivar | Engajar | Gerenciar com cuidado |
| **Médio poder** | Manter | Informar | Monitorar |
| **Baixo poder** | Apoiar | Manter contato | Baixa prioridade |

### Alto poder & alinhado (cultivar)

```dataview
LIST role
FROM "30-stakeholders"
WHERE archived != true AND power = "high" AND alignment = "aligned"
```

### Alto poder & desalinhado (gerenciar com cuidado)

```dataview
LIST role
FROM "30-stakeholders"
WHERE archived != true AND power = "high" AND alignment = "misaligned"
```

## Saúde de relacionamentos

```dataview
TABLE last_interaction AS "Última interação", health, interaction_frequency AS "Cadência alvo"
FROM "30-stakeholders"
WHERE archived != true
SORT last_interaction ASC
```

## Frios há mais de 60 dias (atenção)

```dataview
LIST "Última: " + last_interaction
FROM "30-stakeholders"
WHERE archived != true 
  AND (last_interaction = null OR date(last_interaction) < date(today) - dur(60 days))
SORT last_interaction ASC
```

## Arquivados

```dataview
LIST
FROM "30-stakeholders" OR "80-archive/stakeholders"
WHERE archived = true
```
