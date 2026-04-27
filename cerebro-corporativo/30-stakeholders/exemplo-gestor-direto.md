---
title: Exemplo — Gestor Direto
created: 2026-04-27
updated: 2026-04-27
type: stakeholder
relation: manager
role: Diretor de [Área]
area: [Área]
seniority: D
location: São Paulo
relationship_started: 2024-08
last_interaction: 2026-04-25
interaction_frequency: weekly
health: positive
power: high
alignment: aligned
archived: false
tags: [stakeholder, example]
---

# Exemplo — Gestor Direto

> ⚠️ **Exemplo fictício.** Apague ou mova para `80-archive/examples/` quando popular com dados reais.

## Perfil profissional

- **Cargo atual:** Diretor de [Área]
- **Área / time:** [Área]
- **Reporta a:** [[exemplo-skip-level]]
- **Tempo de empresa:** 6 anos
- **Background relevante:** veio de consultoria estratégica, MBA exterior, segunda passagem como diretor

## Como trabalha

- **Estilo de comunicação:** direto, prefere documento curto antes da conversa
- **Como prefere ser abordado:** Slack para urgências, e-mail para formalizações, 1:1 para temas sensíveis
- **Decision-making style:** data-driven com peso forte em risco político
- **Pontos fortes percebidos:** lê bem o cenário acima, articula bem com pares
- **Limitações percebidas:** detalhe operacional não é prioridade dele; espera que eu cuide

## Interesses e motivadores

- **O que quer alcançar profissionalmente:** ser promovido a VP nos próximos 18 meses
- **Métricas:** OKRs da área + leitura subjetiva de impacto pelo VP
- **Pet topics:** automação de processos, eficiência de custo
- **O que evita:** conflitos abertos em reunião grande; surpresas em fórum executivo

## Leitura política (privada)

- **Aliados conhecidos:** _(a mapear)_
- **Tensões conhecidas:** com [diretor X] (rivalidade histórica por escopo)
- **Capital político atual:** estável-em-alta após entrega de [[exemplo-projeto-beta]]
- **Áreas de influência:** decide sobre headcount da área, peso em comitê de produto
- **Como é percebido no nível acima:** confiável para entregas grandes, ainda em prova para próximo nível

## Minha relação

- **Como nos conhecemos:** ele me recrutou em 2024
- **Histórico:** começou de alta confiança, momento ruim em final de 2025 (perdi prazo do Projeto X), reconstruído após [evento]
- **Onde estou útil:** entrego com baixa supervisão, traduzo técnico para executivo
- **Onde ele é útil:** sponsor explícito, abre portas em fóruns que eu não acessaria
- **Riscos:** se promovido a VP, posso perder gestor próximo; se estagnar, fico no teto
- **Oportunidades de fortalecer:** entregar com excelência [[exemplo-projeto-beta]], que é vitrine dele

## Projetos compartilhados

```dataview
LIST
FROM "20-projects"
WHERE contains(stakeholders, this.file.link) OR contains(team, this.file.link) OR sponsor = this.file.link
```

## Reuniões com esta pessoa

```dataview
TABLE date, meeting_type AS "Tipo"
FROM "50-meetings"
WHERE contains(participants, this.file.link)
SORT date DESC
LIMIT 10
```

## Log de interações relevantes

### 2026-04-25 — 1:1 semanal
- Sinalizou positivamente o avanço em Beta. Pediu para eu apresentar no comitê de maio. **Sinal de investimento em mim.**

### 2026-03-10 — feedback duro sobre comunicação
- Disse que minhas atualizações em comitê estão "longas demais". Levei a sério, ajustei formato.

## Ações pendentes

- [ ] Preparar deck do comitê de maio (3 slides, 1 pergunta — formato dele)
- [ ] Mencionar resultado de [outro projeto] na próxima 1:1
