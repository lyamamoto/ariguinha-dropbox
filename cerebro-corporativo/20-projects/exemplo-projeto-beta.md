---
title: Exemplo — Projeto Beta (migração ERP)
created: 2026-04-27
updated: 2026-04-27
type: project
status: in-progress
priority: P0
horizon: medium
owner_role: tech-lead
sponsor: "[[exemplo-gestor-direto]]"
team: []
stakeholders:
  - "[[exemplo-gestor-direto]]"
  - "[[exemplo-skip-level]]"
projects_related: []
dependencies: []
blocks: []
areas: []
start_date: 2026-02-01
target_date: 2026-09-30
next_milestone: Piloto em uma BU
next_milestone_date: 2026-06-15
budget: R$ 2.5M
tags: [project, example]
---

# Exemplo — Projeto Beta (migração ERP)

> ⚠️ **Exemplo fictício.**

## Por que existe (north star)

> Reduzir custo operacional do back-office em 25% e habilitar consolidação financeira em D+1 (hoje em D+5). Sem esta migração, não suportamos o plano de aquisições.

## Escopo

### Dentro
- Migração do ERP legado para nova plataforma em todas as 4 BUs
- Re-treinamento de 200 usuários
- Integração com sistemas fiscais e de tesouraria

### Fora (explicitamente)
- Reformulação de processos de RH (fase 2)
- Consolidação de contratos com fornecedores (projeto separado)

## Stakeholders e papéis

| Pessoa | Papel | Expectativa |
|--------|-------|-------------|
| [[exemplo-gestor-direto]] | sponsor | atualização semanal, escalada de bloqueios |
| [[exemplo-skip-level]] | aprovador | revisar marcos financeiros |

## Marcos

- [x] **M1:** 2026-03-15 — assinatura do contrato com fornecedor
- [ ] **M2:** 2026-06-15 — piloto em uma BU
- [ ] **M3:** 2026-08-30 — rollout nas BUs restantes
- [ ] **M4:** 2026-09-30 — encerramento do legado

## Estado atual

Design da arquitetura de integração em curso. Time de fornecedor alocado. Sem blockers críticos. Risco principal: resistência de usuários da BU Sul.

## Riscos e blockers

| Risco | Prob. | Impacto | Mitigação | Owner |
|-------|-------|---------|-----------|-------|
| Resistência BU Sul | Alta | Alto | Plano de change management dedicado | eu |
| Atraso fiscal | Média | Alto | Engajar consultoria fiscal cedo | _(a definir)_ |

## Conexões com outros projetos

- Compartilha recurso técnico com [outros projetos da área]: mesmo arquiteto-líder.

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

- Ainda em curso.

## Changelog

- 2026-04-27: criação da nota
- 2026-04-25: sponsor sinalizou apresentação no comitê de maio
- 2026-03-15: M1 concluído (assinatura)
