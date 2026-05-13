# Manual de Construção — vault-agent

> **Para quem é este manual.** Você é um agente de IA com acesso ao filesystem de um vault de conhecimento (estilo Obsidian) e a um diretório de trabalho onde escreverá código. Sua tarefa é produzir uma instância concreta e funcional do framework `vault-agent` adaptada ao vault que você tem em mãos. Este manual descreve **o que** o framework precisa ser e **como** derivar cada parte dele a partir do vault concreto. Você nunca deve produzir o framework abstrato — sempre uma encarnação específica, com nomes de pasta, schemas de frontmatter, regras de propagação e convenções de escrita que refletem o vault real.

> **O que você não deve assumir.** Não assuma que o vault segue a convenção PARA, nem que pastas são numeradas, nem que existe uma pasta chamada `Tasks`. Não assuma que o agente de IA subjacente é Devin — pode ser qualquer CLI com interface equivalente. Não assuma frontmatter algum como universal: o vault declara seus próprios campos, e o framework deve operar sobre esses campos, traduzindo se necessário.

> **O que você deve assumir.** O vault contém Markdown com frontmatter YAML, com algum tipo de wikilinks `[[Foo]]` entre as notas. O operador humano sabe descrever as convenções (vai responder perguntas quando você fizer). Existe um agente de IA invocável via CLI local que aceita um prompt em arquivo, lista de repositórios, e produz output estruturado.

---

## Parte 0 — Anatomia do framework que você vai produzir

O artefato final é um diretório com a seguinte estrutura. Não memorize os nomes — eles são pontos fixos para o que cada parte faz. Adapte-os apenas se houver uma razão local (não há, na maioria dos casos).

```
vault-agent/
├── MANUAL.md                       # Manual descritivo do framework concreto
├── README.md                       # Quickstart (instalação, uso, troubleshooting)
├── pyproject.toml                  # Pacote Python instalável (entry point: vault-agent)
├── config.yaml                     # Configuração específica do vault deste operador
├── config.example.yaml             # Versão sanitizada para versionamento público
├── .devin/                         # Diretório de skills lido pelo agente CLI
│   ├── AGENTS.md                   # Playbook que o agente lê ao ser invocado aqui
│   └── skills/<nome>/SKILL.md      # Uma skill por capacidade discreta
├── templates/
│   ├── task/                       # Templates Jinja2 do modo task
│   │   ├── default.md.j2
│   │   └── <intent>.md.j2          # migration, bugfix, refactor, etc
│   └── feedback/
│       ├── default.md.j2
│       └── <variant>.md.j2         # breaking_changes, etc
├── vault_agent/                    # Pacote Python
│   ├── __init__.py
│   ├── cli.py                      # Click group, entry point
│   ├── config.py                   # Carregamento e validação de config.yaml
│   ├── vault_io.py                 # Leitura de notas, resolução de wikilinks
│   ├── managed_blocks.py           # Detecção e escrita em blocos managed
│   ├── resolver.py                 # Fase 1: tarefa → brief.json
│   ├── prompt_builder.py           # Fase 2 e 5: brief → prompt + agent_config
│   ├── alignment_gate.py           # Fase 3: interação síncrona com operador
│   ├── result_writer.py            # Fase 5 e 7: nota de execução + status
│   ├── feedback_validator.py       # Fase 8: valida invariantes do feedback
│   └── runners/
│       ├── __init__.py
│       ├── base.py                 # AgentRun dataclass, Runner protocol
│       ├── mock.py                 # Runner que não invoca nada (testes, dry-run)
│       └── <agent>.py              # devin.py, claude_code.py, etc
└── tests/
    └── test_smoke.py               # Testes mínimos sem invocar agente real
```

Cada parte deste manual instrui como produzir um desses arquivos a partir do vault concreto. A ordem importa: você precisa entender o vault antes de escrever os schemas, e escrever os schemas antes do código que os consome.

---

## Parte 1 — Descoberta do vault

Antes de escrever qualquer linha de código, percorra o vault para entender o que ele é. Esta fase produz um documento mental (que você pode materializar em `discovery.md` no workdir) com seis seções correspondendo às seis perguntas abaixo. Sem essas respostas, o framework não pode ser construído.

### 1.1 — Topologia de pastas

Liste o diretório raiz do vault. Para cada subdiretório que não seja oculto (não começa com `.`) nem um diretório de plugins do Obsidian (`.obsidian`, `.trash`, `templater`), inspecione recursivamente até encontrar arquivos `.md`. Construa um mapa de qual pasta contém que tipo de nota. Você procura por padrões: uma pasta com muitas notas pequenas e referências cruzadas, uma pasta com notas longas que recebem muitos links, uma pasta com notas que têm checklists e datas.

A maioria dos vaults bem estruturados tem entre quatro e oito pastas de primeiro nível, cada uma com um tipo dominante de nota. Convenções comuns: pastas numeradas (estilo PARA com `10_Areas`, `20_People`, `30_Projects`...), ou pastas nomeadas (`Tasks`, `Applications`, `Projects`). Não force uma convenção sobre o vault — adote a que ele já tem. Se as pastas estão numeradas, suas referências no código e nas skills devem usar os nomes numerados; se não estão, use os nomes simples.

### 1.2 — Tipos de nota

Para cada pasta identificada, abra de três a cinco notas e leia o frontmatter. Procure padrões: notas que declaram `type: project`, `type: application`, ou usam tags como `#projeto`, `#aplicação`. Outras pistas: a presença de campos como `repo` indica uma nota executável; a presença de `email` ou `role` indica uma pessoa; a presença de `status` e `acceptance_criteria` indica uma tarefa.

Catalogue cada tipo em uma tabela mental: nome do tipo, pasta onde vive, campos obrigatórios (presentes em todas as instâncias), campos opcionais frequentes, e qual o "papel" da nota no framework — ela é uma **tarefa** (unidade de trabalho), um **recurso executável** (algo que o agente manipula via repositório), um **contexto** (enriquece o briefing mas não tem ação direta), ou um **alvo de feedback** (recebe atualizações pós-execução).

Nem todo tipo precisa virar parte do framework. Se uma pasta tem apenas notas de diário pessoal ou referências bibliográficas que nunca aparecem em wikilinks de tarefas, ela não pertence ao escopo. Documente o que está dentro e o que está fora.

### 1.3 — Schema da nota de tarefa

Esta é a nota mais importante para o framework. Encontre-a — geralmente é onde estão checklists, status, datas de previsão. Liste todos os campos de frontmatter que aparecem em tarefas. Marque cada um como:

- **Identidade** (sempre presente, único, estável): tipicamente `id` ou o próprio nome do arquivo.
- **Estado** (muda ao longo da vida da tarefa): `status`, `priority`, `due_date`.
- **Relações** (wikilinks para outras notas): `applications`, `projects`, `systems`, `owner`, `collaborators`. Estes são os campos que o Resolver vai seguir.
- **Intenção** (orienta a execução do agente): `template`, `agent`, `sensitivity`, `auto_approve`.
- **Critérios de aceite**: como o operador descreve o que conta como pronto. Pode ser uma lista no frontmatter (`acceptance_criteria: [...]`) ou um heading no corpo da nota (`## Critérios de aceite`).

Decida o campo de "elegibilidade para execução automática". O framework precisa de um sinal explícito que distingue "rascunho" de "pronto para o agente". Convenção sugerida: `agent_ready: true`. Se o vault já tem um campo equivalente (como um status específico tipo `ready` ou `approved`), use o existente em vez de criar um paralelo.

### 1.4 — Schema da nota de recurso executável

A nota executável é aquela cujo conteúdo o framework vai expor ao agente para que ele opere sobre — tipicamente uma aplicação, biblioteca, serviço, infraestrutura. Encontre uma e identifique:

- **Endpoint** do recurso: campo do tipo `repo`, `repository`, `git_url`. Sem isso, a nota não é executável.
- **Branch padrão**: `default_branch`, `main_branch`, ou pode ser ausente e assumir `main`.
- **Caminhos de contexto**: lista de paths dentro do repositório que o agente deve carregar como contexto (`context_paths: ["src/auth/", "docs/"]`). Opcional mas valioso para repos grandes.
- **Sensibilidade**: classificação de risco para escrita autônoma. Convenção sugerida: `low | medium | high`. Pode ditar políticas adicionais no Alignment Gate.
- **Papel no ecossistema**: relações com outras notas (qual sistema, área, time é dono).

Se o vault tem mais de uma classe de nota executável (ex: aplicações *e* bibliotecas, cada uma em sua pasta), o framework as trata uniformemente — todas precisam declarar `repo`. A diferenciação por classe entra na escolha de templates e regras de feedback, não no schema mínimo.

### 1.5 — Convenções de wikilinks

Inspecione como o vault refere notas entre si. Há três padrões comuns que afetam a resolução:

- **Por nome simples**: `[[auth-gateway]]` — o arquivo é `auth-gateway.md` em algum lugar do vault. O Resolver precisa encontrar pelo nome do arquivo.
- **Com caminho**: `[[Applications/auth-gateway]]` — caminho explícito a partir da raiz do vault.
- **Com alias**: `[[auth-gateway|gateway de auth]]` — o destino é `auth-gateway`, o texto exibido é "gateway de auth". A resolução ignora a parte depois do `|`.

Decida qual estratégia o Resolver usará por padrão. Se o vault mistura os três, o Resolver deve aceitar os três. Documente.

Verifique também se os nomes de arquivo têm convenção: kebab-case (`auth-gateway`), TitleCase (`AuthGateway`), Title Case com espaços (`Auth Gateway`), com prefixo de tipo (`app-auth-gateway`). Isso afeta a busca por nome no Resolver.

### 1.6 — Pontos de extensão visíveis no vault

Algumas convenções do framework são imposições novas que você vai introduzir no vault. Outras podem já existir e você só precisa adotá-las. Procure por:

- **Blocos managed**: já existem marcadores tipo `<!-- ... -->` em notas? Se sim, com qual convenção? Se não, você vai introduzir `<!-- managed:start id="..." -->` / `<!-- managed:end id="..." -->`.
- **Pasta de runs**: onde notas de execução de agente deveriam viver? Tipicamente uma subpasta da pasta de tarefas (`Tasks/runs/`), mas se o vault tem convenção própria para "logs" ou "histórico", encaixe aí.
- **Status de tarefa**: que valores existem hoje? (`ready`, `in_progress`, `done`, ou enumeração própria). O framework vai introduzir alguns novos (`awaiting_review`, `failed`, `needs_manual_review`) — verifique se há colisão.

---

## Parte 2 — Conversa com o operador

A descoberta da Parte 1 é a maior parte do trabalho, mas algumas perguntas precisam de validação humana. Reúna-as numa única rodada de perguntas — não pergunte uma de cada vez. Use uma lista numerada, indicando o que você descobriu como inferência e pedindo confirmação.

Perguntas obrigatórias:

1. **Confirmação do mapa de pastas e tipos** — apresente a tabela que você construiu na descoberta e pergunte se está correta, se algum tipo está faltando ou sobrando.

2. **Campo de elegibilidade** — qual sinal usar para distinguir tarefas prontas para o agente. Sugira `agent_ready: true` se nada equivalente existe; ofereça reutilizar um status existente se houver candidato natural.

3. **Agente alvo** — qual CLI será invocada. Identifique o binário (`devin`, `claude-code`, `aider`, custom), a variável de ambiente que carrega o token, e se a CLI já é conhecida do framework (Devin tem suporte de primeira classe; outros podem exigir um runner novo).

4. **Política do Alignment Gate** — quantas rodadas por nível de sensibilidade, qual o comportamento padrão em timeout (cancelar é o seguro), se algum nível admite modo não-interativo.

5. **Convenções de feedback** — para cada tipo de nota alvo de feedback, qual bloco managed receberá atualizações, sob que heading no corpo, e em modo `append` (histórico) ou `replace` (estado atual). Sugira padrões e peça ajustes.

6. **Pasta de notas de execução** — confirme localização e formato do nome de arquivo (sugerir `{run_id}.md` ou `{TASK_ID}__{run_id}.md`).

7. **Idioma** — todas as mensagens do framework, mensagens CLI, prompts dos templates, devem estar em qual idioma? O código (nomes de funções, classes) sempre em inglês, mas docstrings e UI seguem a escolha.

Não prossiga até ter respostas para essas sete perguntas. Aceite "use o padrão que você sugeriu" como resposta válida — mas registre a escolha explícita no `config.yaml` mesmo assim, nunca a deixe implícita no código.

---

## Parte 3 — Princípios invioláveis do framework

Estes princípios são consequência do design e não podem ser violados pela encarnação concreta. Se algo que você está prestes a escrever os viola, pare e reconsidere.

**Separação entre o quê e o como.** A nota de tarefa descreve o que precisa ser feito e com qual contexto. O framework descreve como executar. As notas nunca contêm prompts, instruções para agentes, nem detalhes técnicos da invocação. Esses pertencem a templates versionados.

**Notas como dados estruturados.** Toda decisão automatizada do framework deriva de frontmatter e wikilinks, nunca de texto livre. Texto livre é descrição opcional para humanos. Se uma informação importa para a execução, ela vive num campo estruturado.

**Determinismo na resolução, não-determinismo isolado no agente.** Dado um vault em estado fixo, o Resolver sempre produz o mesmo briefing. O Prompt Builder sempre produz o mesmo prompt a partir do mesmo briefing e do mesmo template. O não-determinismo está isolado no Runner — e mesmo lá, o comando construído é determinístico.

**Humano no loop em pontos de decisão, não em pontos de execução.** A interação humana acontece no Alignment Gate antes da execução. O resto roda sem interação. Não acrescente perguntas em outros pontos.

**Pipeline puro + um único ponto sujo.** Resolver, Prompt Builder, Alignment Gate, Result Writer, Feedback Validator são puros — não fazem efeitos colaterais externos. O Runner é o único componente que toca o mundo (invoca subprocess, fala com o agente). Isso torna o resto testável com `MockRunner`.

**Separação radical de permissões entre invocações.** Na invocação tarefa, o agente vê repositórios em modo write e **não** vê o vault. Na invocação feedback, o agente vê o vault em modo write-restrito-a-blocos-managed e repositórios em **read-only**. Essas restrições são estruturais (declaradas no `agent_config.json` passado ao CLI), não apenas instrucionais no prompt.

**Validação pós-execução do feedback é não-negociável.** Após o agente terminar a invocação feedback, o framework compara o estado do vault antes e depois, e rejeita o resultado se houver mudança fora de blocos managed declarados ou em campos de frontmatter fora do schema declarado de "escrevíveis pelo agente".

**Notas de execução são imutáveis.** Uma vez escritas pelo Result Writer, não são sobrescritas. Reexecuções criam novas notas. A única mudança permitida depois é o conteúdo do bloco managed `feedback-log` (preenchido pelo Feedback Updater) e o campo `feedback_status` no frontmatter da própria nota de execução.

---

## Parte 4 — Os componentes em detalhe

Os componentes formam um pipeline de oito fases. Cada fase tem um componente responsável, uma entrada bem definida, uma saída bem definida, e propriedades verificáveis.

### Fase 1 — Resolver

**Componente.** `vault_agent/resolver.py`. CLI exposta como `vault-agent resolve TASK_ID`.

**Entrada.** Identificador da tarefa (string) e acesso somente-leitura ao vault (caminho do filesystem).

**Saída.** Um arquivo `brief.json` no workdir da execução, conforme o esquema abaixo. Stdout imprime o `run_id` na primeira linha (para captura por scripts).

**Esquema do brief:**

```json
{
  "run_id": "TASK-2026-0142__20260513T103015Z",
  "task": {
    "id": "TASK-2026-0142",
    "title": "Migrar auth-gateway para OIDC",
    "objective": "...",
    "acceptance_criteria": ["...", "..."],
    "priority": "high",
    "sensitivity": "medium",
    "intent": "migration",
    "agent": "devin",
    "auto_approve": false,
    "path_in_vault": "60_Tasks/TASK-2026-0142.md"
  },
  "resources": [
    {
      "id": "auth-gateway",
      "type": "application",
      "role": "primary",
      "repo": "https://github.com/acme/auth-gateway",
      "default_branch": "main",
      "context_paths": ["src/auth/", "docs/"],
      "sensitivity": "medium",
      "path_in_vault": "50_Applications/auth-gateway.md"
    }
  ],
  "context_notes": [
    {"id": "identity-unification-2026", "type": "project", "title": "...", "summary": "..."}
  ],
  "feedback_targets": [
    {"id": "auth-gateway", "type": "application", "role": "primary"},
    {"id": "identity-unification-2026", "type": "project", "role": "context"}
  ]
}
```

**Comportamento.** Localize a nota da tarefa pela pasta declarada em `config.note_schemas.task.folder`, por correspondência entre `id` no frontmatter e `TASK_ID`, ou por nome de arquivo. Verifique campos obrigatórios; se ausentes, falhe com mensagem descritiva. Verifique elegibilidade (`agent_ready` ou equivalente); se não elegível, falhe. Para cada wikilink nos campos relacionais (`applications`, `systems`, `projects`, etc), resolva ao arquivo correspondente, classifique pelo tipo (inferido pela pasta), e extraia os campos relevantes.

Para classificar o `role` de cada recurso: a primeira aplicação na lista de `applications` é `primary`; demais são `consumer`. Se o vault declara papéis explicitamente em algum campo, use-o em vez da heurística.

A construção de `feedback_targets` aplica as regras de `config.feedback.targets` — para cada tipo de nota recém-resolvida, se há regra que se aplica (filtro por `role`, `type`, ou condição), inclui-a. A regra pode declarar `managed_block_id`, `section_header`, `mode` (`append` ou `replace`).

**Erros descritivos.** Use mensagens que apontam diretamente para o que falta:
- `"Tarefa {TASK_ID} não encontrada em {vault_path}/{tasks_folder}/"`
- `"Tarefa {TASK_ID} encontrada mas não está marcada como agent_ready: true"`
- `"Tarefa {TASK_ID} referencia [[X]] mas {X}.md não foi encontrado no vault"`
- `"Aplicação {Y} no caminho {path} não declara o campo obrigatório 'repo'"`

**Propriedades verificáveis.** Determinismo: rodar duas vezes sobre o mesmo vault produz `brief.json` byte-idêntico (exceto pelo `run_id`, que muda a cada chamada). Falha-rápido: nunca produz brief parcial — ou produz um completo ou falha com exit code não-zero.

### Fase 2 — Prompt Builder (modo task)

**Componente.** `vault_agent/prompt_builder.py`, função `build_task(brief, workdir, config)`.

**Entrada.** O `brief.json` (já como dataclass), o workdir, a configuração.

**Saída.** Dois arquivos no workdir:
- `prompt.task.md` — prompt completo para o agente.
- `agent_config.task.json` — declaração estrutural de permissões.

**Esquema do `agent_config.task.json`:**

```json
{
  "mode": "task",
  "agent": "devin",
  "repos": [
    {"url": "https://github.com/acme/auth-gateway", "branch": "main", "access_mode": "write"},
    {"url": "https://github.com/acme/user-service", "branch": "main", "access_mode": "read"}
  ],
  "vault_access": null,
  "timeout_seconds": 3600,
  "output_format": "json"
}
```

**Seleção de template.** A ordem de precedência é: campo `template` no brief (se declarado), mapeamento `config.templates_by_intent[intent]` (se o brief declara intenção e a config mapeia), `config.task_template_default` (último recurso). O arquivo `templates/task/<nome>.md.j2` deve existir; se não, erro.

**Renderização Jinja2.** Use `StrictUndefined` — variável faltante deve causar erro, não renderizar string vazia. As variáveis disponíveis no template são as do brief mais helpers convencionais. Contexto sugerido (alinhe com seus templates):

- `brief` — o objeto inteiro do brief, com acesso a `brief.task.title`, `brief.task.objective`, `brief.task.acceptance_criteria`, etc.
- `repos_write` — lista filtrada de recursos cujo `access_mode` é `write`.
- `repos_read` — lista filtrada de recursos cujo `access_mode` é `read`.
- `context_notes` — lista do brief.
- `run_id` — string.

Não distribua o mesmo dado por dois nomes (`brief.task.title` e também `task_title`) — isso causa drift quando o schema evolui.

**Estrutura recomendada do prompt.task.md:**

```
# Tarefa: {{ brief.task.id }} — {{ brief.task.title }}

## Objetivo
{{ brief.task.objective }}

## Critérios de aceite
{% for c in brief.task.acceptance_criteria %}
- {{ c }}
{% endfor %}

## Repositórios

### Repositórios em escrita
{% for r in repos_write %}
- **{{ r.id }}** ({{ r.repo }}, branch `{{ r.default_branch }}`)
  Contexto: {{ r.context_paths | join(', ') if r.context_paths else 'todo o repo' }}
{% endfor %}

### Repositórios em leitura (consumidores / dependências)
{% for r in repos_read %}
- **{{ r.id }}** ({{ r.repo }})
{% endfor %}

## Contexto adicional
{% for n in context_notes %}
- **{{ n.title }}** ({{ n.type }}): {{ n.summary }}
{% endfor %}

## Output esperado

Ao final, retorne um JSON estruturado no stdout com os campos:

  status: "success" | "failure" | "needs_manual_review"
  summary: descrição em linguagem natural do que foi feito
  artifacts: [{kind: "pr", url: "...", repo: "...", description: "..."}]
  branches_created: [{repo: "...", branch: "..."}]
  files_modified_by_repo: {"repo": ["path1", "path2"]}
```

Adapte os headings e o idioma à decisão da Parte 2.

**Modos com restrição não-óbvia.** O Prompt Builder em modo task **nunca** monta `vault_access` — esse campo fica `null` no JSON. Se um template tenta acessar uma variável de vault, é erro. A separação de permissões começa aqui.

### Fase 3 — Alignment Gate

**Componente.** `vault_agent/alignment_gate.py`. Usa `rich` para renderização e `click` para prompts.

**Entrada.** O `prompt.task.md`, o `agent_config.task.json`, o brief, e a política de gate da config.

**Saída.** Um `alignment.json` no workdir, e um booleano de continuação.

**Comportamento interativo.** Renderize um resumo legível com `rich.Panel`. Inclua:

- Identificador e título da tarefa, prioridade, sensibilidade.
- Primeiras três a cinco linhas do objetivo (truncar com elipse).
- Lista de repositórios e modo de acesso (use ✏️ para write, 👁️ para read).
- Template selecionado e agente alvo.
- Notas que serão alvo de feedback após a execução.
- Caminho local para `prompt.task.md` (o operador pode abrir num editor para inspeção completa).

Solicite uma decisão via `rich.Prompt` ou `click.prompt`. Aceite três opções:

- `a` (aprovar) — pipeline continua sem mudanças.
- `e` (emendar) — solicite texto multi-linha (termina com `.` em linha vazia ou EOF). Apende ao prompt.task.md uma seção `## Ajustes do operador` com o texto. Registre o texto em `alignment.json::amendments`.
- `c` (cancelar) — pipeline para. Exit code 10. Status da tarefa não muda.

**Política de rodadas.** A config declara quantas rodadas por nível de sensibilidade:

```yaml
alignment_gate:
  rounds_by_sensitivity:
    low: 1
    medium: 1
    high: 2
```

Se a tarefa é `high`, após a primeira emenda o gate apresenta novamente o prompt revisado e pede uma confirmação final (segunda rodada). Mais que duas rodadas é contraproducente — vira microgestão.

**Modo não-interativo.** Para CI ou batch, a flag `--no-prompt` é aceita **somente** se a tarefa declara `auto_approve: true` no frontmatter (intenção explícita) **e** a config permite (`alignment_gate.allow_no_prompt: true`). Caso contrário, `--no-prompt` causa erro e exit code 3.

**Auditoria.** O `alignment.json` registra cada rodada com timestamp, decisão, e texto da emenda (se houver). O Result Writer o inclui na nota de execução posteriormente.

### Fase 4 — Runner (modo task)

**Componente.** `vault_agent/runners/<agente>.py`, classe `<Agente>Runner` implementando o protocol `Runner` em `vault_agent/runners/base.py`.

**Entrada.** O `prompt.task.md`, o `agent_config.task.json`, e o workdir.

**Saída.** Um `agent_run.task.json` no workdir, conforme o schema da dataclass `AgentRun` em `base.py`.

**Esquema `AgentRun`:**

```python
@dataclass
class AgentRun:
    run_id: str
    phase: Literal["task", "feedback"]
    agent: str
    status: Literal["success", "failure", "timeout", "needs_manual_review"]
    started_at: str  # ISO 8601
    completed_at: str
    summary: str
    artifacts: list[dict]  # [{kind, url, repo, description}]
    agent_session_id: str | None
    human_amendments: list[str]
    raw: dict  # output bruto do CLI, para depuração
```

**Construção do comando.** Sintaxe varia por CLI. Para Devin (exemplo):

```
devin run \
  --prompt-file {workdir}/prompt.task.md \
  --output-format json \
  --workdir {workdir}/agent-run-task \
  --repo {url}@{branch}              # para cada repo em modo write
  --read-only-repo {url}@{branch}    # para cada repo em modo read
```

Nunca passe o prompt como argumento direto. Sempre via `--prompt-file`. O CLI lê via stdin se a flag não estiver disponível.

**Credenciais.** O token é lido da variável de ambiente declarada em `config.agents.<agente>.token_env` (default sugerido: `DEVIN_TOKEN`), e injetado no `env` do subprocess. **Não** escreva o token em nenhum arquivo do workdir.

**Validação pré-invocação (não-negociável).** Antes de chamar `subprocess.run`, o Runner verifica:

- `agent_config.vault_access` é `None`. Se não for, levante exceção. (Permissão errada no modo task.)
- Pelo menos um repo declarado em modo `write` ou modo `read`. Lista vazia é erro.
- O token está presente em `os.environ[token_env]`. Se ausente, falha imediatamente.
- `agent_config.mode` é `"task"`. Cruzamento de configs é bug.

**Parsing de output.** Tente em ordem:

1. JSON estruturado no stdout. Schema esperado: `{status, summary, artifacts, ...}`.
2. Bloco JSON dentro de texto livre (regex `\{[\s\S]+\}`).
3. Fallback regex para URLs de PR (`https://(github|gitlab)\.com/[\w-]+/[\w-]+/pull/\d+`).
4. Último recurso: `status: needs_manual_review`, raw output salvo em `raw.log` para análise humana.

**Timeout.** Configurável em `config.agents.<agente>.task_timeout_seconds`. Default 3600. Em timeout, mate o processo, marque `status: timeout`.

**Modo dry-run.** Quando o pipeline é invocado com `--dry-run`, o Runner não chama subprocess — apenas escreve o comando que executaria em `command.txt` e produz um `agent_run.task.json` mock com `status: dry_run`. Útil para revisar o pipeline sem custo de invocação.

### Fase 5 — Result Writer (passagem task)

**Componente.** `vault_agent/result_writer.py`, função `write_task_phase(brief, agent_run, alignment, vault_path, config)`.

**Entrada.** O brief, o `agent_run.task.json`, o `alignment.json`, e a configuração.

**Saída.** Efeitos colaterais no vault:
- Criação de uma nota imutável em `{vault_path}/{config.result_writer.execution_notes_folder}/{run_id}.md`.
- Atualização do frontmatter da nota de tarefa original (campos `status`, `last_run`, `last_run_at`).

**Estrutura da nota de execução:**

```markdown
---
type: agent-run
run_id: TASK-2026-0142__20260513T103015Z
task: "[[TASK-2026-0142]]"
agent: devin
template: task/migration
status: success
started_at: 2026-05-13T10:30:15Z
finished_at: 2026-05-13T10:42:33Z
applications: ["[[auth-gateway]]", "[[user-service]]"]
alignment_decision: approved
alignment_rounds: 1
feedback_status: pending
---

# Execução: {{ brief.task.title }}

Tarefa: [[{{ brief.task.id }}]]
Agente: devin (sessão {{ agent_run.agent_session_id }})

## Resumo
{{ agent_run.summary }}

## Artefatos
{% for a in agent_run.artifacts %}
- [{{ a.kind }} em {{ a.repo }}]({{ a.url }}) — {{ a.description }}
{% endfor %}

## Alinhamento
Decisão: aprovado em {{ alignment.rounds|length }} rodada(s).
{% for r in alignment.rounds %}
### Rodada {{ loop.index }}
- Decisão: {{ r.decision }}
{% if r.amendment %}
- Emenda do operador:

  > {{ r.amendment | indent(4) }}
{% endif %}
{% endfor %}

## Feedback

<!-- managed:start id="feedback-log" -->
(aguardando segunda invocação do agente)
<!-- managed:end id="feedback-log" -->
```

**Imutabilidade.** Uma vez escrita, a nota de execução não é sobrescrita pelo Result Writer. A única exceção é o bloco managed `feedback-log` — o Feedback Updater o substitui na passagem 7.

**Atualização da tarefa.** Aplique `config.result_writer.status_transitions` para mapear o status do agent_run para o novo status da tarefa. Sugestão de mapeamento:

- `success` → `awaiting_review`
- `failure` → `failed`
- `timeout` → `failed`
- `needs_manual_review` → `needs_manual_review`

Adicione também `last_run: "[[{run_id}]]"` e `last_run_at: <timestamp ISO>`. Preserve **todos os outros campos** do frontmatter da tarefa intactos — não toque em descrições, owners, datas de criação.

### Fase 6 — Prompt Builder (modo feedback) e Runner (modo feedback)

**Componente.** `prompt_builder.build_feedback(brief, agent_run, run_note_path, workdir, config)` produz `prompt.feedback.md` e `agent_config.feedback.json`. O mesmo Runner é invocado, agora com `mode="feedback"`.

**Esquema do `agent_config.feedback.json`:**

```json
{
  "mode": "feedback",
  "agent": "devin",
  "repos": [
    {"url": "https://github.com/acme/auth-gateway", "branch": "main", "access_mode": "read"}
  ],
  "vault_access": {
    "vault_path": "/home/user/meu-vault",
    "writable_blocks": [
      {"note_path": "50_Applications/auth-gateway.md", "block_id": "agent-activity"},
      {"note_path": "30_Projects/identity-unification-2026.md", "block_id": "activity-log"}
    ],
    "writable_frontmatter_fields": {
      "50_Applications/auth-gateway.md": ["last_agent_run", "last_agent_activity_at"],
      "30_Projects/identity-unification-2026.md": ["last_agent_activity_at"]
    }
  },
  "timeout_seconds": 900,
  "output_format": "json"
}
```

**Conteúdo do prompt.feedback.md.** O template `templates/feedback/default.md.j2` recebe como variáveis: `brief`, `agent_run`, `run_note_path`, `feedback_targets` (lista com `note_path`, `block_id`, `instruction`, `section_header`, `mode`). Estrutura:

```
# Atualização de notas — registro de execução

Você acaba de executar a tarefa {{ brief.task.id }}. O resultado foi:

{{ agent_run.summary }}

PRs abertos: {% for a in agent_run.artifacts %}{{ a.url }}{% if not loop.last %}, {% endif %}{% endfor %}.

Sua tarefa agora é atualizar notas no vault refletindo o que foi feito. Você
escreve apenas dentro de blocos managed declarados — qualquer coisa fora
deles é invariante e será revertida automaticamente.

## Notas a atualizar

{% for t in feedback_targets %}
### {{ t.note_path }}

Bloco managed: `{{ t.block_id }}`
Modo: {{ t.mode }} ({% if t.mode == "append" %}adicionar entrada nova ao histórico{% else %}substituir conteúdo do bloco{% endif %})

Instrução: {{ t.instruction }}

{% endfor %}

## Regras invioláveis

1. **Apenas blocos managed.** Você só escreve entre os marcadores
   `<!-- managed:start id="..." -->` e `<!-- managed:end id="..." -->`.
   Tudo fora é invariante.
2. **Append-only para histórico.** Em blocos com modo `append`, sua entrada
   é apendada — nunca substitui entradas anteriores.
3. **Linguagem natural.** Escreva em prosa, descrevendo a substância da
   mudança. Não copie o título da tarefa nem resuma genericamente.
4. **Idempotência.** Verifique se já existe entrada referenciando este
   run_id antes de criar uma nova. Se existe, não duplique.
5. **Frontmatter como API.** Pode atualizar apenas os campos declarados em
   `writable_frontmatter_fields`. Outros são intocáveis.

## Output esperado

Retorne JSON estruturado:

  status: "success" | "failure" | "partial"
  mutations: [
    {note_path: "...", block_id: "...", change_kind: "appended" | "replaced", chars_changed: N}
  ]
  summary: o que você escreveu, em uma frase.
```

**Validação pré-invocação no Runner (modo feedback).** Antes do subprocess:

- `agent_config.vault_access` **não** é `None`. Ausência é bug.
- Nenhum repo está em modo `write`. Cruzamento de permissões é bug.
- Para cada `writable_block`, o arquivo existe no vault e contém um bloco managed com aquele `id`. Se não contém, o framework cria proativamente (com marcadores `<!-- managed:start -->` e `<!-- managed:end -->`) antes de invocar o agente.
- O Feedback Validator (Fase 8) precisa de um **snapshot pré-execução** do vault. O Runner tira esse snapshot agora: para cada arquivo que pode ser tocado, salva uma cópia em `{workdir}/vault_snapshot_pre/`.

### Fase 7 — Result Writer (passagem feedback)

**Componente.** Mesma `result_writer.py`, função `write_feedback_phase(agent_run_feedback, run_note_path, validation_result, config)`.

**Entrada.** O `agent_run.feedback.json` e o resultado da validação.

**Saída.** Substitui o conteúdo do bloco managed `feedback-log` na nota de execução pré-existente. Atualiza o campo `feedback_status` no frontmatter da nota de execução.

**Conteúdo do bloco feedback-log:**

```markdown
**Status:** {{ status }}  ({{ finished_at }})

Notas atualizadas:
{% for m in mutations %}
- [[{{ m.note_path }}]] → bloco `{{ m.block_id }}` ({{ m.change_kind }}, {{ m.chars_changed }} caracteres)
{% endfor %}

Resumo do que foi escrito:
> {{ summary }}
```

Se a validação **falhou**, em vez do conteúdo normal, escreva um callout de aviso e marque `feedback_status: validation_failed`:

```markdown
> [!warning] Feedback rejeitado pela validação
> A invocação de feedback foi revertida porque o agente modificou conteúdo
> fora dos blocos managed declarados ou tocou em campos de frontmatter
> não-escrevíveis. Detalhes em `runs/{run_id}/validation_violations.json`.
```

### Fase 8 — Feedback Validator

**Componente.** `vault_agent/feedback_validator.py`. CLI: `python -m vault_agent.feedback_validator validate --run-id X --vault Y`.

**Entrada.** O snapshot pré-execução em `{workdir}/vault_snapshot_pre/`, o estado atual do vault, e o `agent_config.feedback.json` declarando o que era permitido.

**Saída.** Um dos:
- Validação OK: nada acontece, retorna exit code 0.
- Validação falhou: escreve `validation_violations.json` no workdir, reverte os arquivos do vault para o snapshot pré, retorna exit code 2.

**Algoritmo.** Para cada arquivo em `vault_snapshot_pre/`:

1. Compare o conteúdo do snapshot com o estado atual do arquivo no vault.
2. Se idêntico, ignore.
3. Se diferente, parse blocos managed em ambos.
4. Para cada bloco managed declarado em `agent_config.vault_access.writable_blocks`, é esperado que mude — ignore essas diferenças.
5. Para todo conteúdo **fora** dos blocos managed declarados, qualquer diferença é violação.
6. Para o frontmatter: parse YAML em ambos. Para cada campo, se mudou e não está em `writable_frontmatter_fields[arquivo]`, é violação.

**Reversão automática.** Se houver violação, o Validator restaura cada arquivo do snapshot por cima do estado atual. O resultado é que o vault volta ao estado pré-execução para os arquivos afetados, e a falha fica registrada na nota de execução.

**Por que isso é seguro.** O Validator é puro — só faz IO de arquivo, sem rede. Se o snapshot existe, a reversão é trivial. Se a reversão falha por motivo de filesystem, isso é falha grave do sistema, não do framework.

---

## Parte 5 — Geração dos artefatos

Agora você produz cada arquivo do framework. A ordem importa porque arquivos posteriores dependem de decisões dos anteriores.

### 5.1 — `config.yaml`

Este é o arquivo mais importante. Toda decisão da Parte 1 e Parte 2 cristaliza aqui. Use a estrutura abaixo, adaptando aos nomes e valores derivados da descoberta.

```yaml
# Vault
vault:
  path: /caminho/absoluto/para/o/vault
  folders:
    tasks: "60_Tasks"          # ou o nome real
    applications: "50_Applications"
    systems: "40_Systems"
    projects: "30_Projects"
    areas: "10_Areas"
    people: "20_People"
    runs: "60_Tasks/runs"

# Workdir efêmero das execuções
workdir:
  root: "./runs"
  keep_after_success: true

# Agentes
agents:
  devin:
    runner: vault_agent.runners.devin.DevinRunner
    cli_path: devin
    token_env: DEVIN_TOKEN
    output_format: json
    task_timeout_seconds: 3600
    feedback_timeout_seconds: 900
  mock:
    runner: vault_agent.runners.mock.MockRunner

default_agent: devin

# Schemas de notas (derivados da descoberta)
note_schemas:
  task:
    folder: "60_Tasks"
    required_fields: [id, status, agent_ready, applications]
    eligibility_field: agent_ready
    eligibility_value: true
    title_field: title
    objective_field: objective       # ou null para extrair do corpo
    intent_field: template
    sensitivity_field: sensitivity
    default_sensitivity: medium
  application:
    folder: "50_Applications"
    required_fields: [id, repo, default_branch]
    sensitivity_field: sensitivity
    default_sensitivity: medium
  project:
    folder: "30_Projects"
    required_fields: [id]
    summary_field: summary
  system:
    folder: "40_Systems"
    required_fields: [id]

# Catálogo de templates
templates:
  task_default: "task/default.md.j2"
  task_by_intent:
    migration: "task/migration.md.j2"
    bugfix: "task/bugfix.md.j2"
    refactor: "task/refactor.md.j2"
  feedback_default: "feedback/default.md.j2"
  feedback_by_intent:
    migration: "feedback/breaking_changes.md.j2"

# Alignment Gate
alignment_gate:
  enabled: true
  rounds_by_sensitivity:
    low: 1
    medium: 1
    high: 2
  allow_no_prompt: false
  timeout_seconds: 600
  on_timeout: cancel

# Feedback
feedback:
  targets:
    - type: application
      role: primary
      managed_block_id: agent-activity
      section_header: "## Atividade recente do agente"
      mode: append
      instruction: "Descreva o que mudou na aplicação, com foco em interfaces externas."
    - type: application
      role: consumer
      managed_block_id: dependency-changes
      section_header: "## Mudanças em dependências"
      mode: append
      instruction: "Descreva como a mudança no primary afeta este consumer."
    - type: project
      role: any
      managed_block_id: activity-log
      section_header: "## Histórico"
      mode: append
      instruction: "Registre um marco do projeto, em uma frase, com link para a nota de execução."
    - type: system
      role: any
      managed_block_id: agent-activity
      section_header: "## Atividade recente"
      mode: append
      instruction: "Resumo de uma frase sobre o que mudou neste sistema."
  writable_frontmatter_fields:
    application: [last_agent_run, last_agent_activity_at]
    project: [last_agent_activity_at]
    system: [last_agent_activity_at]
  feedback_repos_readonly: true
  validation:
    enforce_managed_blocks_scope: true
    enforce_frontmatter_scope: true
    revert_on_violation: true

# Result Writer
result_writer:
  execution_notes_folder: "60_Tasks/runs"
  filename_template: "{run_id}.md"
  status_transitions:
    on_task_success: awaiting_review
    on_task_partial: awaiting_review
    on_task_failure: failed
    on_task_timeout: failed
    on_task_needs_manual_review: needs_manual_review
    on_feedback_validation_failure: needs_manual_review

# Segurança
security:
  high_sensitivity_requires_extra_confirmation: true
  blocked_repos: []
  validate_vault_isolation_on_task: true
```

Produza também `config.example.yaml` — idêntico, mas com paths anonimizados (`/path/to/vault`) e tokens removidos.

### 5.2 — Pacote Python

O `pyproject.toml` declara dependências mínimas: `python-frontmatter`, `PyYAML`, `Jinja2`, `click`, `rich`. Python 3.11+. Entry point:

```toml
[project]
name = "vault-agent"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "python-frontmatter>=1.0",
  "PyYAML>=6.0",
  "Jinja2>=3.1",
  "click>=8.1",
  "rich>=13.0",
]

[project.scripts]
vault-agent = "vault_agent.cli:main"
```

Os módulos são produzidos respeitando as responsabilidades das Fases 1 a 8. Princípios de implementação:

**`vault_io.py`** — função `load_note(path)` retorna `(frontmatter_dict, body_str)` usando `python-frontmatter`. Função `extract_wikilinks(text)` retorna lista de alvos (sem colchetes, sem alias). Função `resolve_wikilink(vault_path, target, search_folders, preferred_folder=None)` aplica a estratégia da seção 1.5. Levante `WikilinkNotFoundError` quando não há match.

**`managed_blocks.py`** — regex `START_PATTERN = re.compile(r'<!-- managed:start id="([^"]+)" -->')` e `END_PATTERN = re.compile(r'<!-- managed:end id="([^"]+)" -->')`. Dataclass `ManagedBlock(id, content, start_line, end_line)`. Funções `find_managed_blocks(text)`, `replace_managed_block(text, id, new_content)`, `append_to_managed_block(text, id, addition)`, `ensure_managed_block_exists(path, id, section_heading)`, e a função crítica `diff_outside_managed_blocks(text_before, text_after, declared_ids)` que normaliza ambos os textos substituindo blocos managed declarados por um placeholder uniforme, e então compara — qualquer diferença após normalização é violação.

**`config.py`** — dataclass `Config` com properties tipadas. Função `load_config(path=None)` busca em ordem: argumento explícito, `./config.yaml`, `~/.vault-agent/config.yaml`. Levanta erro descritivo se nenhum encontrado.

**`resolver.py`** — função `resolve(task_id, config)` retorna um dict `brief`. Função `make_run_id(task_id)` gera `{TASK_ID}__{ISO_timestamp_compact}` (ex: `TASK-2026-0142__20260513T103015Z`). CLI `python -m vault_agent.resolver TASK_ID` imprime o run_id na primeira linha do stdout e grava `brief.json` no workdir.

**`prompt_builder.py`** — funções `build_task(brief, workdir, config)` e `build_feedback(brief, agent_run, run_note_path, workdir, config)`. Use Jinja2 `Environment` com `StrictUndefined`. Helpers `select_template(brief, mode, config)` aplica a precedência declarada na Fase 2.

**`alignment_gate.py`** — função `run(prompt_path, agent_config_path, brief, workdir, config, no_prompt=False)`. Use `rich.console.Console` e `rich.panel.Panel`. Função auxiliar `render_summary(brief, agent_config)` retorna um Panel. Função `append_amendment(prompt_path, text)` apenda seção `## Ajustes do operador` ao arquivo. Levante `AlignmentCancelled` em cancelamento.

**`result_writer.py`** — funções `write_task_phase(brief, agent_run, alignment, vault_path, config)` e `write_feedback_phase(agent_run_feedback, run_note_path, validation_result, config)`. A primeira cria a nota de execução; a segunda substitui o bloco managed `feedback-log`. Função `update_task_status(task_path, new_status, last_run_link)` toca apenas os campos previstos.

**`feedback_validator.py`** — função `validate(workdir, vault_path, agent_config_feedback)` retorna `ValidationResult` (dataclass com `ok: bool`, `violations: list[dict]`). Em violação, restaure os arquivos do snapshot por cima do estado atual.

**`runners/base.py`** — dataclass `AgentRun` conforme schema da Fase 4. Protocol `Runner` com método `run(prompt_path, agent_config, workdir, run_id) -> AgentRun`.

**`runners/mock.py`** — `MockRunner` registra o comando em `command.txt`, produz `agent_run.{phase}.json` com artefatos simulados (PR fake), retorna `status: dry_run` em modo dry-run e `status: success` em modo normal.

**`runners/devin.py`** — `DevinRunner.run()` implementa a invocação real. Construção do comando, parsing de output, todas as validações de pré-invocação descritas na Fase 4.

**`cli.py`** — group Click com comandos:

- `vault-agent run TASK_ID [--dry-run --no-prompt --skip-feedback --agent X]` — orquestra todas as 8 fases.
- `vault-agent resolve TASK_ID` — só Fase 1, imprime brief no stdout.
- `vault-agent status RUN_ID` — lê a nota de execução, imprime estado atual.
- `vault-agent revert RUN_ID` — desfaz o feedback dessa execução (chama o Feedback Validator em modo restore).

Mensagens CLI no idioma escolhido na Parte 2. Erros devem ter exit codes distintos: 0 sucesso, 1 erro geral, 2 violação de validação, 3 alignment cancelado/sem autorização, 10 cancelamento explícito.

### 5.3 — Templates Jinja2

Crie em `templates/task/` e `templates/feedback/`. Os schemas de variáveis devem ser **consistentes** com o que o Prompt Builder injeta. Não tenha dois templates que aceitem variáveis diferentes — isso é fonte de bugs.

Templates de task obrigatórios:

- `task/default.md.j2` — fluxo genérico, sem assumir intenção específica.
- `task/migration.md.j2` — adiciona seção "Estratégia de rollback" e "Consumidores a atualizar".
- `task/bugfix.md.j2` — adiciona seções "Reproduzir o problema", "Causa raiz", "Teste de regressão".
- `task/refactor.md.j2` — adiciona "Comportamento a preservar" e "Sinais de regressão".

Templates de feedback obrigatórios:

- `feedback/default.md.j2` — descrito na Fase 6.
- `feedback/breaking_changes.md.j2` — enfatiza registro de consumers afetados, deprecations, migration path.

Todos os templates referenciam apenas as variáveis declaradas pelo Prompt Builder. Use `{% if variable is defined %}` para campos opcionais; falha de variável obrigatória é desejável (catch-bugs).

### 5.4 — Skills do agente

Em `.devin/skills/<nome>/SKILL.md`. Cada skill é um documento que o agente lê quando uma fase é executada. Frontmatter YAML obrigatório:

```yaml
---
name: <nome-da-skill>
description: <uma frase descrevendo quando usar>
allowed-tools: [read, write, exec]   # subset que essa skill precisa
---
```

Skills obrigatórias (uma por capacidade discreta):

- `resolver` — leitura e validação da tarefa, produção do brief.
- `prompt-builder` — geração de prompt e agent_config.
- `alignment-gate` — fluxo interativo com operador.
- `runner-task` (ou `invocar-<agente>-task`) — invocação do CLI em modo task.
- `runner-feedback` (ou `invocar-<agente>-feedback`) — invocação do CLI em modo feedback.
- `result-writer` — criação da nota de execução.
- `ler-vault` — utilitários de leitura sem modificação.
- `escrever-nota-managed` — regras invioláveis de escrita em blocos managed.
- `feedback-validator` — validação pós-execução.

Cada SKILL.md é curto (50-150 linhas), denso, com exemplos. Não duplica conteúdo do MANUAL.md — referencia onde apropriado.

### 5.5 — AGENTS.md

Um arquivo na raiz de `.devin/` que o agente lê ao ser invocado neste diretório. Estrutura:

```markdown
# AGENTS.md — vault-agent

## Propósito
Você pode estar aqui em um de três modos:
1. **Orquestrador** — recebeu um TASK_ID e executa o pipeline completo.
2. **Executor task** — foi invocado pelo Runner com prompt-file, foco em código.
3. **Executor feedback** — foi invocado pelo Runner com prompt-file, foco no vault.

## Variáveis de ambiente
- VAULT_PATH, TASK_ID, <AGENT>_TOKEN, VAULT_AGENT_WORKDIR

## Pipeline (modo 1)
8 fases, pare em qualquer falha. Veja .devin/skills/ para detalhes.
(...)

## Regras gerais
- Nunca pule o Alignment Gate sem autorização explícita.
- Nunca escreva no vault fora de blocos managed.
- Em falha, registre erro em runs/{run_id}/ antes de encerrar.
```

### 5.6 — MANUAL.md

Versão descritiva do framework concreto. Documenta as decisões cristalizadas na config (estrutura de pastas adotada, schemas de notas decididos, política de gate específica do operador). Não é cópia deste manual — é o resultado, em forma narrativa.

### 5.7 — README.md

Quickstart de 50 a 100 linhas. Instalação (`pip install -e .`), exemplo de `config.yaml` mínima, comando para uma execução completa, troubleshooting dos cinco erros mais comuns (env var ausente, tarefa não elegível, wikilink quebrado, validação de feedback falhou, timeout).

### 5.8 — Testes de fumaça

Em `tests/test_smoke.py`. Cobrir:

- Resolução de wikilink em três variantes (simples, com caminho, com alias).
- Detecção de blocos managed em uma nota de exemplo.
- `diff_outside_managed_blocks` retorna vazio quando só blocos declarados mudaram.
- `diff_outside_managed_blocks` retorna violações quando algo fora mudou.
- Render de template task com MockRunner produz prompt sem erro.
- Render de template feedback idem.

Não invoque o agente real. Use o MockRunner. Os testes devem rodar em menos de 5 segundos no total.

---

## Parte 6 — Validação do framework produzido

Antes de declarar o framework pronto, execute os seguintes testes de aceitação. Se qualquer um falhar, há algo errado e você precisa corrigir.

**Smoke test 1 — instalação.** `pip install -e .` no diretório do framework completa sem erro. `vault-agent --help` mostra os subcomandos.

**Smoke test 2 — resolução.** `vault-agent resolve TASK_ID` sobre uma tarefa de exemplo produz `brief.json` sintaticamente válido com todos os campos preenchidos. Stdout contém o `run_id` na primeira linha.

**Smoke test 3 — dry-run.** `vault-agent run TASK_ID --dry-run --agent mock` executa todas as 8 fases sem invocar agente real. Produz brief, prompt task, alignment.json (aprovação automática ou stub), agent_run.task.json mock, nota de execução no vault, prompt feedback, agent_run.feedback.json mock, validação OK, atualização do feedback-log na nota de execução.

**Smoke test 4 — falha controlada.** Mexa uma tarefa para retirar `agent_ready: true` e rode `vault-agent resolve`. O comando falha com exit code não-zero e mensagem clara apontando o campo faltante.

**Smoke test 5 — validação de feedback.** Crie manualmente uma nota com bloco managed `X` declarado, simule um agent_run que modificou conteúdo fora desse bloco, rode o validator. Resultado: violação detectada, arquivo restaurado para o snapshot.

**Smoke test 6 — idempotência do brief.** Rode `resolve` duas vezes e compare os dois `brief.json` (excluindo `run_id`). Devem ser byte-idênticos.

**Smoke test 7 — separação de permissões.** Inspecione os dois `agent_config` produzidos por um run dry: o `task` tem `vault_access: null` e pelo menos um repo write; o `feedback` tem `vault_access` populado, todos os repos em read-only.

**Smoke test 8 — testes unitários.** `pytest tests/` passa todos. Tempo total abaixo de 10 segundos.

Se todos os oito passam, o framework está estruturalmente correto. A validação semântica (os templates produzem prompts úteis, as regras de feedback geram registros legíveis) só pode ser feita executando contra o agente real em uma tarefa de baixo risco.

---

## Parte 7 — Anti-padrões a evitar

Estes são erros frequentes que comprometem o design. Releia esta lista antes de declarar pronto.

**Não embuta prompts em notas de tarefa.** Tentação de adicionar "## Instruções para o agente" no corpo da tarefa é grande. Resista — prompts vivem em templates.

**Não use texto livre para informação que dirige execução.** Se o agente precisa saber qual módulo modificar, isso vai em um campo de frontmatter (`scope: src/auth/`), não no corpo da nota.

**Não permita Resolver invocar agentes nem Runner consultar o vault.** A separação de papéis é o que torna o framework auditável.

**Não trate notas de execução como mutáveis.** Reexecução abre nova nota. Edição manual delas é exceção emergencial, não fluxo normal.

**Não pule o Alignment Gate em produção sem motivo documentado.** Se você se pega configurando `allow_no_prompt: true` por padrão para todas as tarefas, recue.

**Não exponha o vault em modo write na invocação task.** Se você criar uma rota onde isso acontece, alguém vai usar.

**Não confie cegamente no agente de feedback.** Sempre valide pós-execução. Sempre tenha snapshot.

**Não acople templates ao schema bruto das notas.** O brief é o contrato. Templates leem o brief, não as notas.

**Não passe prompts como argumento de linha de comando.** Use sempre `--prompt-file`. CLI args têm limite de tamanho e logam em históricos.

**Não duplique nomes ou conceitos.** Se em um lugar o campo se chama `task.title` e em outro `title_da_tarefa`, alguém vai consumir o errado. Escolha um nome e use em todo lugar.

**Não invente fallback de schema silencioso.** Campo obrigatório ausente é erro, não warning. Falha-rápido é amizade com seu eu futuro.

---

## Parte 8 — Critério de pronto

O framework está bem implementado quando todos os seguintes são verdade:

1. Trocar o formato das notas exige editar apenas `resolver.py` e `config.yaml::note_schemas`. Outros módulos ficam intactos.
2. Adicionar um novo agente exige apenas escrever `runners/<novo>.py` que satisfaz o protocol `Runner`. Outros módulos ficam intactos.
3. Adicionar uma nova intenção de tarefa exige apenas um novo template em `templates/task/` e uma entrada em `config.yaml::templates.task_by_intent`.
4. Adicionar uma nova regra de feedback exige apenas uma entrada em `config.yaml::feedback.targets`. Nenhum código muda.
5. `--dry-run` produz todos os artefatos e renderiza todos os prompts, sem invocar o agente em nenhum momento.
6. Os oito smoke tests da Parte 6 passam.
7. O Alignment Gate é invocado em toda execução por padrão. A única forma de pulá-lo exige duas configurações explícitas (na config E na tarefa).
8. A validação pós-feedback nunca rejeita resultados em operação normal — só rejeita quando o agente realmente errou.
9. Reexecutar uma tarefa antiga produz o mesmo brief, prompt e agent_config (exceto pelos timestamps).
10. O vault permanece útil sem que ninguém precise editar manualmente notas para registrar atividade do agente.

Se você atende aos dez critérios, parabéns: produziu uma instância funcional do `vault-agent` que respeita o design original e serve ao operador concreto.

Se um critério falha, não force — diagnostique. Quase sempre a falha aponta para uma decisão errada na Parte 1 ou Parte 2 que se propagou. Volte às respostas do operador, reveja o vault, e ajuste a config antes de mexer no código.
