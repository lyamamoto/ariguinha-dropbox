# Quick Start — Adoção Mínima

Não precisa configurar tudo para começar. Este guia define o **subconjunto mínimo** para ter disciplina básica com o Devin, e o **caminho de adoção progressiva** para expandir conforme a necessidade.

---

## Nível 1: O essencial (comece aqui)

**5 Knowledge items + 2 Playbooks.** Suficiente para: planejar sprints, executar tasks com disciplina, e fechar sprints com rastreabilidade básica.

### Knowledge

| ID | Por que é essencial |
|----|-------------------|
| **K-PPM-04** (task format) | Sem formato consistente de tasks, o backlog vira bagunça. |
| **K-PPM-06** (prioritization) | Sem priorização, você não sabe o que fazer primeiro. |
| **K-PPM-13** (execution discipline) | As regras de comportamento mid-sprint. Sem isso, escopo expande, status não é atualizado, descobertas viram implementações não planejadas. |
| **K-PPM-14** (anti-patterns) | A lista de erros comuns. Funciona como guardrail passivo. |
| **K-GIT-01** (branching) | Branches e PRs organizados. Sem isso, tudo vai direto pra main. |

### Playbooks

| Macro | Por que é essencial |
|-------|-------------------|
| **!ppm-planning** (PB-PPM-03) | Selecionar tasks, criar sprint, criar branch. O ponto de compromisso. |
| **!ppm-close** (PB-PPM-05) | Fechar sprint, checar ACs, abrir sprint PR. Sem close, nada é oficialmente "feito". |

### O que você perde sem o resto
- Sem K-PPM-01/02/03: naming pode ficar inconsistente, mas o Devin ainda consegue trabalhar.
- Sem K-PPM-05/07/08: features e sprints vão ter formato livre, mas existem.
- Sem !ppm-bootstrap: você cria a estrutura manualmente uma vez.
- Sem !ppm-assessment e !ppm-refinement: você lê o status e groomeia o backlog informalmente.

---

## Nível 2: Estrutura completa (+10 min de setup)

Adicione quando sentir que o Nível 1 está funcionando mas falta consistência nos formatos.

### Knowledge adicionais

| ID | O que ganha |
|----|------------|
| **K-PPM-01** (directory structure) | Devin cria arquivos no lugar certo. |
| **K-PPM-02** (naming conventions) | IDs consistentes (E-NNN, F-NNN, T-TEAM-NNN). |
| **K-PPM-03** (traceability) | Garante que todo task tem Source, todo AC tem test. |
| **K-PPM-05** (feature format) | Features com stories e ACs no formato padrão. |
| **K-PPM-07** (sprint format) | Sprint files com goal, task table, test plan, retro. |
| **K-PPM-11** (project status) | Devin sabe atualizar maturity e coverage. |
| **K-PPM-12** (navigation guide) | Devin sabe onde encontrar cada tipo de informação. |

### Playbooks adicionais

| Macro | O que ganha |
|-------|------------|
| **!ppm-bootstrap** (PB-PPM-00) | Setup automatizado ao invés de manual. |
| **!ppm-assessment** (PB-PPM-01) | Leitura estruturada do estado antes de planejar. |
| **!ppm-refinement** (PB-PPM-02) | Groom do backlog, re-priorização, close da retro anterior. |
| **!ppm-new-requirement** (PB-PPM-06) | Fluxo completo de requirement → tasks → priorização. |

---

## Nível 3: Multi-projeto e arquitetura (+15 min de setup)

Adicione quando tiver múltiplos projetos, equipes, ou precisar de documentação de arquitetura interativa.

### Knowledge adicionais

| ID | O que ganha |
|----|------------|
| **K-PPM-08** (NFR format) | NFRs estruturados (SLA, security, observability, etc.). |
| **K-PPM-09** (foundations) | Devin documenta tech stack, coding standards, ADRs. |
| **K-PPM-10** (multi-project) | Regras de shared code, cross-cutting features, consolidação. |
| **K-ARCH-01 a 04** | Documentação de arquitetura em JSON-LD com visualização interativa. |

### Playbooks adicionais

| Macro | O que ganha |
|-------|------------|
| **!arch-create** (PB-ARCH-01) | Criar documentação de arquitetura para um sistema. |
| **!arch-update** (PB-ARCH-02) | Atualizar (integrado ao !ppm-close condicionalmente). |

---

## Nível 4: Padrões de código por projeto

Adicione conforme cada projeto tiver um padrão de arquitetura de código definido.

| Quando | O que criar |
|--------|------------|
| Projeto usa WinForms + WebView2 + React | K-WV2-01 a K-WV2-04 (pinados ao repo) |
| Projeto usa Clean Architecture C# | Criar K-CLEANAPI-01, K-CLEANAPI-02 (seguindo modelo) |
| Projeto usa Next.js | Criar K-NEXTJS-01, K-NEXTJS-02 (seguindo modelo) |
| Qualquer outro padrão | 2 Knowledge items: structure + extending |

---

## Resumo visual

```
Nível 1 (essencial)     → 5 Knowledge + 2 Playbooks    → 15 min setup
Nível 2 (completo)      → +7 Knowledge + 4 Playbooks   → +10 min setup
Nível 3 (multi/arch)    → +7 Knowledge + 2 Playbooks   → +15 min setup
Nível 4 (código)        → +2-4 Knowledge por padrão    → +10 min por padrão
```

Comece pelo Nível 1. Use por 2-3 sprints. Suba de nível quando sentir que falta algo.
