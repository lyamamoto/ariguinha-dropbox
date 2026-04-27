# Daily Flow

Como usar o vault no dia a dia depois do setup.

## Manhã (5 minutos)

1. **Abrir Obsidian.** Obsidian Git puxa automaticamente as mudanças do GitHub (PRs do Devin que você aprovou ontem, edições de outros devices).
2. **Abrir [[HOME]].** Bater o olho:
   - Stakeholders frios? Anotar 1-2 nomes para lembrar de contatar.
   - Projetos sem update há 14+ dias? Decidir se atualizo ou não.
   - ADRs paradas? Decidir.
3. **Criar daily de hoje.** Cmd+N → arquivo `daily/YYYY-MM-DD.md`. Cole o conteúdo de `templates/daily.md`. Defina foco do dia.

## Durante o dia

### Notas rápidas (você mesmo, no Obsidian)
- Append no daily de hoje conforme as coisas acontecem
- Insight para virar resource? `Cmd+N` em `40-resources/`
- Ideia para projeto novo? `Cmd+N` em `20-projects/` mesmo sem detalhes — preenche depois

### Reuniões (você ou Devin)

**Se a reunião é curta e simples:**
- Você mesmo cria a nota usando `templates/meeting.md`
- 5 minutos de trabalho, fica feito

**Se a reunião é longa, com transcript ou bullets extensos:**
- Cole os bullets em uma issue do GitHub com label `meeting`
- Devin estrutura a nota, atualiza perfis dos participantes, abre PR
- Você revisa em ~30 minutos

### Decisões importantes (Devin)
- Aconteceu uma decisão que deveria virar ADR? Abra issue com label `adr`
- Forneça contexto, opções, decisão (se já existe)
- Devin formata, numera, abre PR

### Stakeholder novo (Devin)
- Conheceu alguém novo importante? Issue com label `stakeholder-update`
- Devin cria stub para você completar campos sensíveis depois

## Final do dia (5 minutos)

1. **Fechar o daily.** Marcar tarefas concluídas, mover não-concluídas para amanhã.
2. **Atualizar projetos tocados hoje.** Se mudou status de algum projeto, atualizar o frontmatter (`updated`, `status`, `next_milestone`).
3. **Commitar.** No Obsidian: Cmd/Ctrl+P → "Obsidian Git: Create backup" (faz add + commit + push).
4. **Fechar Obsidian.**

## Sexta-feira (15 minutos)

1. **Pedir weekly review ao Devin.** Issue:
   > **Título:** [weekly-review] semana XX/2026
   > 
   > **Corpo:** Gere weekly review da semana passada conforme template.
2. **Aguardar PR** (alguns minutos a algumas horas, dependendo da fila do Devin).
3. **Revisar PR** — bater olho no que ele consolidou.
4. **Aprovar e mergear.**
5. **Pull no Obsidian** e ler a weekly review com calma.
6. **Atualizar `70-career/wins-and-narrative.md`** (LOCAL!) com vitórias da semana.

## Final do mês

1. **Revisar áreas** (`10-areas/`). Quais estão amarelas/vermelhas? Por quê? Plano para o mês seguinte.
2. **Revisar `70-career/objectives.md`** (LOCAL!). Avanços. Bloqueios. Recalibração.
3. **Backup de `70-career/`** para drive pessoal.

## Final do trimestre

1. **Revisar `70-career/political-map.md`** (LOCAL!). Mudanças no terreno?
2. **Revisar `70-career/career-map.md`** (LOCAL!). Estou no caminho?
3. **Conversa de carreira com gestor** se for o caso. Use insumos privados para se preparar; não compartilhe o conteúdo.

## Princípios

- **Capture muito, organize depois.** No daily, jogue tudo. Devin/você organiza em outro momento.
- **Devin para volume, você para nuance.** Reunião de 1h com transcript = Devin. Reflexão íntima sobre relação com chefe = você no Obsidian, em `70-career/`.
- **Pull antes de editar coisas que Devin pode estar tocando.** Se você editou um stakeholder enquanto Devin abriu PR no mesmo arquivo, vai ter conflito.
- **Commit pequeno e frequente.** Não acumule mudanças por dias.
- **Nunca toque em `70-career/` no GitHub.** Se você acidentalmente versionar essa pasta, é vazamento. Confira `git status` antes de cada commit.

## Padrões anti-conflito com Devin

Para minimizar conflitos:
- **Avise o Devin se vai editar muito de uma área.** Ex: "Vou reorganizar todos os perfis de stakeholders hoje, não tome ações em `30-stakeholders/` até eu avisar."
- **Não atribua tarefas concorrentes ao Devin** que tocam o mesmo arquivo simultaneamente.
- **Após merge de PR do Devin, faça pull imediato** antes de editar.
