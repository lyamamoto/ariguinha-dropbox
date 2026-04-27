# Devin Playbook

Receitas prontas para abrir issues que o Devin executa bem. Copie, ajuste, abra.

> Como você não tem GitHub Actions, **toda automação parte de você abrir uma issue**. Devin monitora issues criadas no repo (com label) e age conforme o `AGENTS.md`.

## Convenção de labels

Use sempre uma das labels abaixo no título OU como GitHub label:
- `meeting` — nota de reunião
- `adr` — registro de decisão
- `stakeholder-update` — perfil de pessoa
- `project-update` — atualização de projeto
- `weekly-review` — consolidação semanal
- `cleanup` — manutenção do vault
- `question` — Devin responde sem abrir PR

## Receita 1 — Nota de reunião

```markdown
**Título:** [meeting] 2026-04-28 — 1:1 com gestor

**Corpo:**

Devin, crie nota de reunião com:

- **Data:** 2026-04-28
- **Tipo:** 1on1
- **Duração:** 30min
- **Participantes:** [[exemplo-gestor-direto]]
- **Projetos relevantes:** [[exemplo-projeto-beta]]
- **Confidencial:** sim (1on1)

**Bullets do que aconteceu:**

- Conversamos sobre meu próximo trimestre
- Ele sugeriu foco no projeto Beta como vitrine
- Ficou de me indicar para apresentar no comitê de produto de maio
- Pediu que eu envie deck até quarta da próxima semana
- Mencionou desconforto com [outro stakeholder] mas não detalhou

**Action items meus:**
- Preparar deck do comitê (formato dele: 3 slides, 1 pergunta)
- Sondar contexto da tensão com [outro stakeholder] sem perguntar diretamente

**Próximos passos:**
- Próxima 1:1: 2026-05-05
- Quero pautar: avanço do deck, retorno do comitê
```

## Receita 2 — ADR

```markdown
**Título:** [adr] Escolha de fornecedor de monitoramento APM

**Corpo:**

Devin, crie ADR com:

- **Escopo:** technical
- **Status inicial:** proposed
- **Proposto por:** eu
- **Projetos afetados:** [[exemplo-projeto-beta]]
- **Stakeholders consultados:** [[exemplo-gestor-direto]]

**Contexto:**

Precisamos escolher fornecedor de APM para o novo ERP. Atualmente sem monitoramento estruturado. Sem decisão até final de maio, vamos para produção sem visibilidade — risco alto.

**Opções consideradas:**

- **Opção A — Datadog:** caro mas completo, time já familiarizado.
- **Opção B — New Relic:** preço médio, integra com ferramentas atuais.
- **Opção C — Solução open-source (Grafana stack):** barato mas demanda time dedicado de SRE que não temos.

**Decisão preliminar:** Opção B (New Relic) — sweet spot custo × esforço.

**Trade-offs aceitos:** menos features avançadas vs. Datadog, mas suficiente para nosso caso.
```

## Receita 3 — Atualizar perfil de stakeholder

```markdown
**Título:** [stakeholder-update] Atualizar exemplo-gestor-direto após 1:1

**Corpo:**

Devin, atualize [[exemplo-gestor-direto]]:

1. **last_interaction:** 2026-04-28
2. **Adicionar entrada no log:**
   - Data: 2026-04-28
   - Conteúdo: "1:1 semanal. Sinalizou positivamente avanço em Beta. Pediu apresentação no comitê de maio. Mencionou tensão com [X] sem detalhar — sinal de que devo mapear."
3. **Adicionar action item:** "Sondar contexto da tensão sem perguntar diretamente"

NÃO altere campos políticos (power, alignment, capital político) — esses ficam comigo.
```

## Receita 4 — Criar projeto novo

```markdown
**Título:** [project-update] Criar projeto: implantação de OKRs no time

**Corpo:**

Devin, crie projeto novo em `20-projects/` com:

- **Nome:** implantacao-okrs-time
- **Status:** planning
- **Prioridade:** P1
- **Horizonte:** medium
- **Owner role:** ic
- **Sponsor:** [[exemplo-gestor-direto]]
- **Stakeholders:** [[exemplo-gestor-direto]] (sponsor), time direto (a popular)
- **Start:** 2026-05-01
- **Target:** 2026-08-30
- **Próximo marco:** workshop de OKRs com time (2026-05-15)

**North star:** Time precisa de clareza de prioridades trimestrais. Hoje cada um puxa para um lado, gerando retrabalho. OKRs bem implantados reduzem retrabalho em 30%.

**Escopo dentro:**
- Workshop de OKRs com time (1 dia)
- Definir 3 OKRs do time para Q3
- Estabelecer ritual de check-in quinzenal
- Definir formato de scoring no fim do ciclo

**Escopo fora:**
- OKRs individuais (decisão de cada um)
- Cascata para áreas pares (não tenho mandato)

**Riscos iniciais:**
- Time pode ver como burocracia — mitigação: vender como ferramenta de foco, não controle
- Sponsor pode mudar prioridade no meio — mitigação: alinhar pesos no início
```

## Receita 5 — Weekly review

```markdown
**Título:** [weekly-review] semana 17 (2026-04-20 a 2026-04-26)

**Corpo:**

Devin, gere a weekly review da semana 17 de 2026 conforme `templates/weekly.md`.

Período: 2026-04-20 a 2026-04-26.

Use Dataview para puxar:
- Reuniões da semana
- ADRs criados/atualizados
- Projetos com update na semana
- Stakeholders com interação na semana

Use `python3 scripts/check_freshness.py` para a seção de sinais de atenção:
- stakeholders 60
- projects 14
- adrs 30

**NÃO** inclua análise de carreira. **NÃO** tente acessar `70-career/` (não está no repo).

Salve em `00-index/weekly/2026-W17.md` e abra PR.
```

## Receita 6 — Manutenção do vault

```markdown
**Título:** [cleanup] Validar links e regenerar índices

**Corpo:**

Devin:

1. Rode `python3 scripts/validate_links.py` e me reporte links quebrados.
2. Para cada link quebrado, sugira correção (sem aplicar — só sugerir).
3. Liste tags em uso: `grep -rh "^tags:" --include="*.md" . | sort -u`
4. Sinalize tags próximas (ex: `decision` vs `decisions`) que talvez devam ser unificadas.
5. NÃO faça mudanças automaticamente — abra PR só se eu aprovar as sugestões em comentário aqui.
```

## Receita 7 — Pergunta sem PR

```markdown
**Título:** [question] Quem são meus stakeholders mais frios?

**Corpo:**

Devin, sem abrir PR — só me responda nesta issue:

1. Liste stakeholders com `last_interaction` há mais de 60 dias.
2. Para cada um, diga: relação, última interação registrada, e em quais projetos eles aparecem.
3. Sugira ordem de prioridade para eu retomar contato.

Use as informações do vault. Não invente nem julgue.
```

## Receita 8 — Reorganização (use com cuidado)

```markdown
**Título:** [cleanup] Reorganizar tags de stakeholders

**Corpo:**

Devin:

Hoje temos uma mistura de tags em stakeholders: `chefe`, `gestor`, `lideranca`. Quero unificar tudo em `manager`.

Plano:
1. Liste todos os arquivos de `30-stakeholders/` que têm essas tags.
2. Me mostre a lista nos comentários — só depois da minha aprovação, abra PR.
3. PR: substituir `chefe`, `gestor`, `lideranca` por `manager` no campo tags.
4. Não toque em outros campos.
5. Não toque em `70-career/`.
```

## Anti-padrões (não pedir)

❌ "Devin, atualize meu mapa político-institucional com o que aconteceu hoje"
- Mapa político está em `70-career/`. Não está no repo. Devin não pode.

❌ "Devin, decida qual fornecedor escolher entre essas opções"
- Devin organiza. Você decide. Pedidos de decisão devem virar ADR `proposed` e você decide depois.

❌ "Devin, escreva minha auto-avaliação de performance"
- Sensível. Mesmo que estivesse no repo, esse tipo de conteúdo deve ser seu, com sua voz.

❌ "Devin, mande mensagem para [stakeholder] sobre X"
- Devin atua só no repo Git. Sem integração com Slack/email.

❌ "Devin, faça merge do PR sozinho se passar nos checks"
- Sem checks (não temos Actions). Sempre revise antes de mergear.

## Quando algo dá errado

**PR do Devin tem informação errada:**
- Comente no PR pedindo correção específica
- Devin atualiza o PR (não abre novo)

**PR do Devin invadiu `70-career/`:**
- IMPOSSÍVEL no nosso setup (gitignore bloqueia)
- Se acontecer mesmo assim: NÃO mergeie. Investigue por que `.gitignore` falhou.

**Devin alucinou um stakeholder ou projeto:**
- Comente: "este stakeholder não existe — apague essa referência"
- Devin corrige

**Devin parou de seguir AGENTS.md:**
- Verifique se AGENTS.md continua na branch que ele está vendo
- Lembre: "consulte `.devin/AGENTS.md` antes de prosseguir"
