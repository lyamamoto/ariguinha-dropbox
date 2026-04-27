# Cérebro Corporativo

Vault Obsidian de trabalho de um colaborador que toca múltiplos projetos interligados em ambiente corporativo. Mantido com auxílio do **Devin** (Cognition) através do GitHub.

## Como funciona

```
┌──────────────────┐                       ┌─────────────────────┐
│  Obsidian local  │   Obsidian Git plugin │  GitHub corporativo │
│  (você edita)    │ ◄───────────────────► │  (origin/main)      │
│                  │   pull / commit / push│                     │
└──────────────────┘                       └─────────────────────┘
                                                  ▲    │
                                                  │    │ PR
                                                  │    ▼
                                           ┌─────────────────────┐
                                           │       Devin         │
                                           │  (clona, escreve    │
                                           │   em branch, abre   │
                                           │   PR para revisão)  │
                                           └─────────────────────┘
```

**Importante:** a pasta `70-career/` está no `.gitignore` e **não** vai para o GitHub. Ela existe apenas localmente, no seu Obsidian. Devin nunca a vê. Faça backup dela separadamente em drive pessoal.

## Estrutura

| Pasta | Versionada? | Propósito |
|-------|-------------|-----------|
| `00-index/` | ✅ | Índices Dataview e dashboard |
| `10-areas/` | ✅ | Áreas permanentes de responsabilidade |
| `20-projects/` | ✅ | Projetos com início, meio e fim |
| `30-stakeholders/` | ✅ | Pessoas-chave |
| `40-resources/` | ✅ | Frameworks, referências |
| `50-meetings/` | ✅ | Atas e notas de reuniões |
| `60-decisions/` | ✅ | ADRs |
| `70-career/` | ❌ **LOCAL APENAS** | Carreira, ambições, mapa político (privado) |
| `80-archive/` | ✅ | Notas que saíram de circulação |
| `daily/` | ✅ | Notas diárias |
| `templates/` | ✅ | Modelos para Devin e Templater |
| `attachments/` | parcial | Imagens; PDFs/vídeos no `.gitignore` |

## Setup inicial

Veja [`docs/SETUP.md`](docs/SETUP.md) — passo a passo de:
1. Criar repositório corporativo no GitHub
2. Clonar localmente
3. Configurar Obsidian com plugins (Git + Dataview)
4. Conectar Devin
5. Criar primeira nota

## Ciclo diário

Veja [`docs/DAILY-FLOW.md`](docs/DAILY-FLOW.md) — como você usa no dia a dia:
- Abrir Obsidian (pull automático)
- Editar/escrever direto no Obsidian para tarefas rápidas
- Abrir issue no GitHub para tarefas que o Devin deve fazer
- Revisar PR do Devin no celular ou desktop
- Fazer merge e pull

## Como pedir ações para o Devin

Veja [`docs/DEVIN-PLAYBOOK.md`](docs/DEVIN-PLAYBOOK.md) — exemplos prontos:
- "Crie uma nota de reunião a partir destes bullets"
- "Atualize o perfil deste stakeholder com a interação de hoje"
- "Gere o weekly review da semana passada"
- "Reorganize as tags em todo o vault"

## Princípios

- Devin organiza informação. Você decide.
- `70-career/` nunca sai do seu computador.
- Todo PR do Devin é revisado antes do merge.
- Quando em dúvida, Devin pergunta em vez de inventar.
- A interface principal é o Obsidian. O GitHub é canal de revisão.
