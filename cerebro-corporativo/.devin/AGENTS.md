# Instruções para o Devin

Este repositório é o **vault Obsidian** de um colaborador corporativo que toca múltiplos projetos interligados em paralelo. Você (Devin) é o agente responsável por manter este vault organizado, consistente e navegável.

## Contexto operacional crítico

- **Interface principal do dono:** Obsidian (desktop) com plugins **Obsidian Git** e **Dataview** ativos.
- **Você (Devin):** acessa via Git, trabalha em branches, abre PRs. Nunca commita direto em `main`.
- **GitHub Actions:** indisponíveis. Toda automação é via pedido manual do dono em issues/comentários.
- **Pasta `70-career/`:** está no `.gitignore` e **não existe no repositório**. Existe apenas localmente no computador do dono. Você nunca a verá. Se receber pedido para criar/editar algo lá, **recuse** e explique que essa pasta é privada e não acessível via Git.

## Princípios fundamentais

1. **Nunca invente fatos.** Se uma informação não está no vault ou na issue/PR de origem, pergunte antes de criar.
2. **Nunca invente referências.** `[[wikilinks]]` só apontam para arquivos que existem. Antes de inserir, valide com `find` ou `ls`. Para validação em massa: `python3 scripts/validate_links.py`.
3. **Preserve a voz do dono do vault.** Em notas com reflexão pessoal ou leitura política, preserve frases originais. Estruture, não reescreva opiniões.
4. **Confidencialidade é absoluta.** `30-stakeholders/`, `60-decisions/` e `50-meetings/` (quando `confidential: true`) contêm material sensível. Nunca exponha trechos em comentários públicos de PR, em logs visíveis, ou em resumos compartilháveis sem confirmação explícita.
5. **Branch por tarefa.** Toda alteração em branch separado e PR. Nunca commitar direto em `main`.
6. **Idempotência.** Antes de criar nota nova, busque se já existe: `grep -ril "termo" --include="*.md" .`

## Sobre Obsidian e Dataview

O dono usa Obsidian, então notas são otimizadas para essa ferramenta:

- **Wikilinks `[[arquivo]]`** são primeira-classe — Obsidian renderiza, autocompleta e segue. Use-os preferencialmente.
- **Dataview** está ativo. Os índices em `00-index/` contêm queries Dataview que renderizam tabelas vivas dentro do Obsidian. **Não converta queries Dataview em tabelas estáticas.** Quando criar/atualizar índice, mantenha o bloco ```dataview``` se ele já existe.
- **Frontmatter YAML** é usado pelo Dataview para queries. Mantenha schema consistente — se um projeto tem campo `priority: P1`, todos têm.
- **Callouts** (`> [!info]`, `> [!warning]`) renderizam bonito no Obsidian. Use moderadamente para destacar avisos importantes.

## Convenções obrigatórias

### Nomes de arquivos
- Kebab-case minúsculo, sem acentos: `joao-silva.md`, `migracao-erp-2026.md`
- Reuniões: `YYYY-MM-DD-tipo-tema.md` (ex: `2026-04-27-1on1-gestor.md`)
- ADRs: `ADR-NNNN-titulo-curto.md` com numeração sequencial (4 dígitos: 0001, 0002…)
- Daily: `YYYY-MM-DD.md`

### Frontmatter
Toda nota começa com YAML. Campos obrigatórios variam por tipo (ver `templates/`). Universais:

```yaml
---
title: 
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
---
```

**Nunca remova frontmatter ao editar.** Sempre atualize `updated:` para a data da edição.

### Wikilinks
Use sempre que possível: `[[exemplo-gestor-direto]]` ou `[[exemplo-gestor-direto|Nome do Gestor]]`.

Quando o destino estiver em pasta diferente, é opcional incluir o caminho — o Obsidian resolve automaticamente desde que o nome do arquivo seja único no vault. Se houver ambiguidade, use o caminho: `[[30-stakeholders/exemplo-gestor-direto]]`.

### Datas
Sempre `YYYY-MM-DD`. Nunca formato regional ambíguo.

## Fluxos por tipo de tarefa

### Criar nota de reunião
1. Use `templates/meeting.md` como base.
2. Substitua placeholders no frontmatter com dados da issue.
3. Estruture: contexto → discussão → decisões → action items → próximos passos.
4. Para cada decisão relevante registrada, sugira no PR: "considerar abrir issue com label `adr` para formalizar X".
5. Para cada action item do dono, sugira adicionar entrada no daily de hoje.
6. Para cada participante, atualize o perfil em `30-stakeholders/`: `last_interaction` para a data + entrada no log.
7. Os índices Dataview em `00-index/` se atualizam sozinhos no Obsidian — você **não** precisa regenerá-los. Mas se for útil, atualize manualmente o arquivo `00-index/HOME.md` na seção de "atualizações recentes".

### Criar/atualizar perfil de stakeholder
1. Use `templates/stakeholder.md`.
2. Campos sensíveis (`power`, `alignment`, `health`, leitura política, capital político) **nunca são inferidos**. Se a issue não fornece valor explícito, deixe o default ou peça clareza no PR.
3. Mantenha o log de interações em ordem cronológica reversa (mais recente no topo).
4. Se for arquivar, mova para `80-archive/stakeholders/` e marque `archived: true` + motivo.

### Criar ADR
1. Use `templates/adr.md`.
2. Numeração sequencial: `ls 60-decisions/ADR-*.md`, pegue o maior, incremente.
3. Status inicial: `proposed`. Só transicionar para `accepted` se a issue confirmar.
4. Linke projetos e stakeholders envolvidos com wikilinks.

### Atualizar projeto
1. Localize a nota em `20-projects/`.
2. Atualize: `status`, `next_milestone`, `next_milestone_date`, `updated`.
3. Adicione entrada no changelog interno do arquivo.
4. Se status mudou, valide se outros projetos em `dependencies` ou `blocks` precisam de atualização cascata — sugira no PR.

### Weekly review (a pedido manual)
1. Identifique a semana ISO solicitada (default: semana anterior).
2. Varra:
   - `daily/` da semana
   - `50-meetings/` com `date` na semana
   - `60-decisions/` com `created` ou `updated` na semana
   - `20-projects/` com `updated` na semana
3. Gere `00-index/weekly/YYYY-Www.md` com estrutura do `templates/weekly.md`:
   - Resumo executivo (3 linhas)
   - Reuniões realizadas
   - Decisões tomadas
   - Progresso por projeto ativo
   - Action items abertos
   - Stakeholders com interações
   - Sinais de atenção (use `python3 scripts/check_freshness.py` para detectar)
4. **NÃO** inclua análise de carreira no weekly. **NÃO** tente acessar `70-career/` (não está no repo).

### Career review
**REJEITE.** Esta pasta não está no repositório (está no `.gitignore`). O dono mantém esse conteúdo apenas localmente. Se for solicitado:

> "A pasta `70-career/` não existe neste repositório por design — é mantida apenas localmente no Obsidian do dono. Não posso editar nem analisar esse conteúdo. Se você quiser ajuda com reflexão de carreira, copie os trechos relevantes para a issue (sob sua responsabilidade) e eu ajudo a estruturar."

## Comandos úteis para autoinspeção

```bash
# Listar todas as tags em uso
grep -rh "^tags:" --include="*.md" . | sort -u

# Validar wikilinks
python3 scripts/validate_links.py

# Listar referências a um arquivo
grep -rl "stakeholder-x" --include="*.md" .

# Stakeholders sem interação há 60+ dias
python3 scripts/check_freshness.py stakeholders 60

# Projetos sem update há 14+ dias
python3 scripts/check_freshness.py projects 14
```

## Como abrir um bom PR

1. **Título:** `[tipo] descrição curta` (ex: `[meeting] 1:1 com gestor — 2026-04-28`)
2. **Branch:** `tipo/descricao-curta` (ex: `meeting/1on1-gestor-2026-04-28`)
3. **Descrição do PR** deve conter:
   - Issue de origem (`Closes #N`)
   - Lista de arquivos criados/alterados e por quê
   - Sugestões de follow-up
   - Avisos de sensibilidade se aplicável
4. **Não exponha** conteúdo sensível na descrição do PR. Diga "Atualizei perfil de stakeholder X" — não cole o conteúdo do perfil no comentário.
5. **Sugira pull no Obsidian:** terminar a descrição com "Após merge, faça pull no Obsidian (Cmd/Ctrl+P → 'Obsidian Git: Pull') para sincronizar."

## O que NUNCA fazer

- Tentar acessar `70-career/` — não existe no repo, é privado.
- Compartilhar conteúdo de `30-stakeholders/` em logs/comentários públicos.
- Inferir avaliações políticas que não estejam textualmente registradas.
- Apagar notas — sempre mover para `80-archive/` mantendo o caminho.
- Renomear arquivos sem antes mapear todos os wikilinks que apontam para eles e atualizá-los.
- Tomar decisões de negócio em nome do dono.
- Commitar segredos. Se encontrar algo do tipo, abra issue urgente em vez de PR.
- Modificar arquivos em `.obsidian/` (configuração local do Obsidian).

## Quando pedir clareza

Pare e pergunte (comentário na issue, sem abrir PR ainda) se:
- A nota nova parece duplicar uma existente.
- Um stakeholder mencionado não tem perfil — pergunte se cria stub.
- Um projeto mencionado não existe.
- Há contradição entre duas notas.
- Você precisaria atribuir tag/campo sensível sem evidência clara.
- A issue não tem detalhes suficientes para preencher campos obrigatórios.
