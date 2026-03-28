# PPM Framework — Devin Setup Guide

Fragmentação do PPM Framework, Architecture Documentation, Git Workflow, e padrões de código em Knowledge items e Playbooks para uso no Devin.

---

## Convenção de nomenclatura

Todos os itens seguem o padrão `{tipo}-{domínio}-{número}-{slug}`:

| Domínio | Prefixo Knowledge | Prefixo Playbook | Escopo |
|---------|-------------------|-----------------|--------|
| **PPM** (Project & Portfolio Management) | `K-PPM-` | `PB-PPM-` | Governance, workflow, sprints, backlog, traceability |
| **ARCH** (Architecture Documentation) | `K-ARCH-` | `PB-ARCH-` | JSON-LD visualization, PREMISES, interactive docs |
| **GIT** (Git Workflow) | `K-GIT-` | — | Branching, commits, PRs |
| **WV2** (WebView2 Desktop Stack) | `K-WV2-` | — | WinForms + WebView2 + React embeddado (stack específico) |

Para novos padrões de código, crie domínios como `K-CLEANAPI-`, `K-NEXTJS-`, `K-FLUTTER-`, etc.

---

## Knowledge Items

Cada arquivo deve ser adicionado como item de Knowledge no Devin. Copie o **Content** como texto e o **Trigger** como trigger description.

### PPM — Project & Portfolio Management
Pine ao(s) repo(s) que usam o PPM framework.

| ID | Arquivo | Trigger (resumido) |
|----|---------|-------------------|
| K-PPM-01 | `K-PPM-01-directory-structure.md` | Criar/navegar arquivos em `docs/ppm/` |
| K-PPM-02 | `K-PPM-02-naming-conventions.md` | Criar epics, features, tasks, sprints, NFRs, ADRs |
| K-PPM-03 | `K-PPM-03-traceability-model.md` | Criar tasks, linkar artefatos, verificar rastreabilidade |
| K-PPM-04 | `K-PPM-04-task-format.md` | Criar/editar tasks no backlog |
| K-PPM-05 | `K-PPM-05-feature-format.md` | Criar features, user stories, acceptance criteria |
| K-PPM-06 | `K-PPM-06-prioritization.md` | Pontuar tasks, planejar sprints |
| K-PPM-07 | `K-PPM-07-sprint-format.md` | Criar/editar sprint files |
| K-PPM-08 | `K-PPM-08-nfr-format.md` | Criar/editar NFRs |
| K-PPM-09 | `K-PPM-09-foundations-layer.md` | Editar foundations/ (tech stack, coding standards, ADRs) |
| K-PPM-10 | `K-PPM-10-multi-project-governance.md` | Trabalhar em monorepo multi-equipe |
| K-PPM-11 | `K-PPM-11-project-status.md` | Atualizar project-status.md, avaliar maturidade |
| K-PPM-12 | `K-PPM-12-navigation-guide.md` | "O que construir agora?", início de trabalho PPM |
| K-PPM-13 | `K-PPM-13-execution-discipline.md` | Implementar tasks, lidar com descobertas mid-sprint |
| K-PPM-14 | `K-PPM-14-anti-patterns.md` | Revisar processos, debug de iterações |

### ARCH — Architecture Documentation
Pine ao(s) repo(s) que contêm a pasta `architectures/`.

| ID | Arquivo | Trigger (resumido) |
|----|---------|-------------------|
| K-ARCH-01 | `K-ARCH-01-data-model.md` | Criar/editar `architecture.jsonld` |
| K-ARCH-02 | `K-ARCH-02-naming.md` | Criar IDs para serviços, infra, flows, ADRs |
| K-ARCH-03 | `K-ARCH-03-directory.md` | Criar docs de arquitetura, navegar `architectures/` |
| K-ARCH-04 | `K-ARCH-04-visualization.md` | Customizar `index.html`, `colors.css`, `ARCH_CONFIG` |

### GIT — Git Workflow
Pine a todos os repos.

| ID | Arquivo | Trigger (resumido) |
|----|---------|-------------------|
| K-GIT-01 | `K-GIT-01-branching.md` | Criar branches, fazer commits, abrir PRs |

### WV2 — WebView2 Desktop Stack (padrão específico)
Pine APENAS ao(s) repo(s) que contêm apps desktop WinForms + WebView2 + React embeddado. NÃO pinar a repos de backend C# standalone ou frontend React web-only.

| ID | Arquivo | Trigger (resumido) |
|----|---------|-------------------|
| K-WV2-01 | `K-WV2-01-react-spa-structure.md` | Escrever React dentro do projeto desktop (SPA embeddado) |
| K-WV2-02 | `K-WV2-02-react-spa-extending.md` | Adicionar domínio/serviço/factory no SPA desktop |
| K-WV2-03 | `K-WV2-03-csharp-host-structure.md` | Escrever C# no host WinForms+WebView2 |
| K-WV2-04 | `K-WV2-04-csharp-host-extending.md` | Adicionar handler, registrar DI, build pipeline do host |

---

## Playbooks

### PPM — Project & Portfolio Management

| Macro | Arquivo | Quando usar |
|-------|---------|-------------|
| `!ppm-bootstrap` | `PB-PPM-00-bootstrap.md` | Primeira vez aplicando o PPM a um projeto |
| `!ppm-assessment` | `PB-PPM-01-assessment.md` | Início de cada iteração (leitura) |
| `!ppm-refinement` | `PB-PPM-02-refinement.md` | Após assessment, antes de planejar |
| `!ppm-planning` | `PB-PPM-03-planning.md` | Selecionar tasks, criar sprint file + branch |
| `!ppm-close` | `PB-PPM-05-close.md` | Final do sprint, fechar tudo |
| `!ppm-new-requirement` | `PB-PPM-06-new-requirement.md` | Criar novo requisito a qualquer momento |

### ARCH — Architecture Documentation

| Macro | Arquivo | Quando usar |
|-------|---------|-------------|
| `!arch-create` | `PB-ARCH-01-create.md` | Criar docs de arquitetura para um sistema novo |
| `!arch-update` | `PB-ARCH-02-update.md` | Atualizar docs de arquitetura existentes |

> **Nota:** A Phase 4 (Execution) não tem Playbook. As regras de comportamento durante execução estão no K-PPM-13 (Execution Discipline), injetado automaticamente pelo trigger.

---

## Fluxo de uso

**Projeto novo:**
```
!ppm-bootstrap
```

**Início de iteração (a cada sprint):**
```
!ppm-assessment
!ppm-refinement
!ppm-planning              (cria sprint file + branch sprint/{NNN})
```

**Durante o sprint:**
```
(K-PPM-13 automático: branch feature → implement → PR → merge, por task)
(K-GIT-01 automático: naming de branches, formato de commits, template de PR)
(K-WV2-* automático: regras de código, se o repo usa esse stack)
!ppm-new-requirement       (quando surge algo novo)
```

**Final do sprint:**
```
!ppm-close                 (fecha ACs, verifica PRs, arch update condicional, abre sprint PR)
```

---

## Como Knowledge e Playbooks se conectam

### Na teoria

**Knowledge** = contexto que o Devin precisa *saber*. Injetado automaticamente pelo sistema de triggers.

**Playbook** = procedimento que o Devin precisa *seguir*. Invocado explicitamente via macro.

A conexão: **o Playbook diz O QUE fazer; o Knowledge diz COMO fazer**.

### Múltiplas camadas de Knowledge em paralelo

Quando o Devin implementa uma task num repo desktop WebView2, quatro camadas operam simultaneamente:

- **K-PPM-13** (execution discipline): lê o AC, implementa, testa, abre PR.
- **K-GIT-01** (branching): cria branch `feature/T-ENG-051-...`, commita com `feat(T-ENG-051): ...`.
- **K-WV2-01** (React SPA structure): coloca o contract em `src/api/contracts/`, nunca importa transport em feature.
- **K-WV2-03** (C# host structure): cria handler no Bridge, registra no DI.

PPM governa o projeto, GIT governa o versionamento, WV2 governa o código. Complementares e não conflitantes.

---

## Padrões de arquitetura de código (por projeto)

Cada projeto pode ter um padrão de código que o Devin deve seguir. Os Knowledge de padrão são **pinados ao repo específico**, não a todos os repos.

**Por que são Knowledge e não Playbooks:**
- Regras permanentes, não procedimentos com início e fim.
- Necessários sempre que o Devin escreve código, não em um momento específico.
- Injetados contextualmente pelo trigger.

**Como criar Knowledge para um novo padrão:**
1. Identifique o documento de arquitetura do projeto (`ARCHITECTURE-*.md`).
2. Fragmente em 2-3 Knowledge items: **estrutura + regras de dependência** e **extensão + convenções**.
3. Pine APENAS ao(s) repo(s) que usam aquele padrão.
4. Use um domínio descritivo e específico ao stack: `K-WV2-` (não `K-CSHARP-`), `K-CLEANAPI-` (não `K-DOTNET-`).
5. Nos triggers, inclua delimitadores negativos: "NOT for standalone backends".

**Se o mesmo repo tem múltiplos stacks** (monorepo com desktop + API):
- Pine ao repo, mas use triggers específicos por path: "quando editar arquivos em `apps/desktop-app/`".
- O trigger é o filtro real de contexto — o pin é só o primeiro nível.

---

## Notas de design

### Por que fragmentar o framework.md em Knowledge?
O framework.md (31KB) contém regras que o Devin precisa em contextos específicos — não tudo de uma vez. Fragmentar em itens com triggers permite injeção seletiva.

### Por que transformar o workflow.md em Playbooks?
O workflow.md é processual. Cada fase é um procedimento independente com entrada, saída e regras claras, mapeando para Playbooks com macros.

### Adaptações necessárias
- **Team codes:** ajuste os códigos de time (ENG, SAL, RET, ADM, PLT) no K-PPM-02.
- **Novos padrões de código:** crie domínios novos seguindo o modelo de 2 Knowledge items (structure + extending) por padrão.
