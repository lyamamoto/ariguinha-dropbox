# Setup Inicial

Passo a passo para começar do zero. Faça uma vez.

## Pré-requisitos

- [ ] Obsidian instalado (https://obsidian.md)
- [ ] Git instalado na máquina (vem com Xcode no Mac, baixar em git-scm.com no Windows)
- [ ] Conta no GitHub corporativo (gerenciada pela TI)
- [ ] Acesso ao Devin (Cognition) liberado pela TI
- [ ] **Validado com a TI** que repos pessoais de produtividade são permitidos e que conexão do Devin a esses repos é aceita

## Parte 1 — Criar o repositório corporativo

### 1.1. Criar repo vazio no GitHub

Pelo GitHub web (na sua conta corporativa):

1. Botão "+" → "New repository"
2. Nome: `cerebro-corporativo` (ou outro de sua preferência)
3. Visibilidade: **Private**
4. **NÃO** inicializar com README (vamos subir o nosso)
5. Criar

### 1.2. Subir conteúdo deste pacote

No terminal, na pasta onde você descompactou este pacote:

```bash
cd cerebro-corporativo

# Inicializar Git
git init
git branch -M main

# Configurar identidade (use o e-mail corporativo)
git config user.email "voce@empresa.com"
git config user.name "Seu Nome"

# Conectar ao remote
git remote add origin git@github.com:SUA-ORG/cerebro-corporativo.git

# Primeiro commit
git add .
git commit -m "chore: inicializar vault corporativo"
git push -u origin main
```

> Se você ainda não tem chave SSH configurada para o GitHub corporativo, troque `git@github.com:...` por `https://github.com/SUA-ORG/cerebro-corporativo.git`. Você precisará autenticar com Personal Access Token na primeira vez.

### 1.3. Conferir que `70-career/` NÃO foi para o repo

```bash
git ls-files 70-career/
```

Deve retornar **apenas** `70-career/README.md` (o explicativo). Nenhum outro arquivo. Se aparecer mais coisa, algo está errado no `.gitignore` — pare e corrija antes de continuar.

## Parte 2 — Configurar Obsidian

### 2.1. Abrir o vault

No Obsidian:
1. Tela inicial → "Open folder as vault"
2. Selecione a pasta `cerebro-corporativo` que você acabou de criar
3. Confiar no autor dos plugins quando perguntado (você é o autor)

### 2.2. Habilitar plugins comunitários

Settings (Cmd/Ctrl + ,) → Community plugins:
1. "Turn on community plugins" (aceitar aviso)
2. "Browse" → instalar:
   - **Obsidian Git** (autor: Vinzent)
   - **Dataview** (autor: Michael Brenan)
3. Voltar a Community plugins → ativar ambos

### 2.3. Configurar Obsidian Git

Settings → Obsidian Git:
- **Vault backup interval (minutes):** 0 (não auto-commit)
- **Auto pull interval (minutes):** 5 (puxa mudanças do Devin a cada 5min)
- **Pull updates on startup:** ✅
- **Disable notifications:** opcional
- **Commit message:** `vault: {{date}} - {{numFiles}} files`
- **List filed updates in commit body:** ✅ (útil para histórico)

> Por que `Vault backup interval = 0`: você quer ter controle de quando commita. Auto-commit junto com Devin pode causar conflitos.

### 2.4. Configurar Dataview

Settings → Dataview:
- **Enable JavaScript Queries:** ✅ (algumas queries avançadas usam DataviewJS)
- **Enable inline queries:** ✅
- **Render null as:** `—` (mais bonito que vazio)
- **Date format:** `yyyy-MM-dd`

### 2.5. Verificar que tudo funciona

1. Abra `00-index/HOME.md` no Obsidian
2. Você deve ver tabelas Dataview rendrizadas (não código bruto)
3. Se vê código bruto, Dataview não está ativo — volte e ative

## Parte 3 — Conectar Devin

### 3.1. Adicionar repo ao Devin

No painel do Devin:
1. Settings → Integrations → GitHub
2. Autorizar Devin a acessar repos da sua organização corporativa
3. Selecionar `cerebro-corporativo`

### 3.2. Validar que Devin lê o `AGENTS.md`

Crie uma issue de teste no GitHub:

> **Título:** [test] Confirme que você leu AGENTS.md
> 
> **Corpo:**  
> Devin, leia `.devin/AGENTS.md` e me responda nesta issue listando os 5 princípios fundamentais do vault. Não abra PR — só comente.

Espere alguns minutos. Devin deve comentar com a lista correta. Se não, revise as configurações.

### 3.3. Primeiro PR de verdade

Abra issue:

> **Título:** [meeting] 1:1 inicial — teste do fluxo
> 
> **Corpo:**  
> Crie nota de reunião com:
> - Data: hoje
> - Tipo: 1on1
> - Participantes: [[exemplo-gestor-direto]]
> - Bullets:
>   - Conversamos sobre meu próximo trimestre
>   - Ele sugeriu foco no projeto Beta
>   - Ficou de me indicar para apresentar no comitê

Devin deve abrir PR criando arquivo em `50-meetings/` e atualizando o perfil do stakeholder.

### 3.4. Aprovar PR e sincronizar Obsidian

1. Revise o PR no GitHub
2. Faça merge
3. No Obsidian: Cmd/Ctrl+P → "Obsidian Git: Pull"
4. Os arquivos aparecem no vault

## Parte 4 — Popular `70-career/` (LOCAL APENAS)

### 4.1. Copiar templates de carreira para a pasta local

```bash
# Estando no vault
cp templates/career/career-map.md 70-career/career-map.md
cp templates/career/objectives.md 70-career/objectives.md
cp templates/career/political-map.md 70-career/political-map.md
cp templates/career/skills-matrix.md 70-career/skills-matrix.md
cp templates/career/wins-and-narrative.md 70-career/wins-and-narrative.md
cp templates/career/performance-reviews.md 70-career/performance-reviews.md
```

### 4.2. Verificar que NÃO foram parar no Git

```bash
git status
```

A saída deve mostrar `nothing to commit, working tree clean`. Se aparecer algum arquivo de `70-career/`, **pare e corrija o `.gitignore`** antes de qualquer outra coisa.

### 4.3. Configurar backup pessoal

Faça uma das opções:

**Opção 1 — iCloud/Drive pessoal:**
1. Crie pasta `cerebro-backup/` em iCloud Drive (conta pessoal, não corporativa)
2. Copie `70-career/` para lá manualmente quando atualizar
3. Pode automatizar com script `cron` ou `launchd` (Mac)

**Opção 2 — zip criptografado:**
```bash
zip -er ~/cerebro-career-backup-$(date +%Y%m%d).zip 70-career/
# Mova o zip para drive pessoal
```

**Opção 3 — repositório Git pessoal:**
- Crie repo privado na sua conta **pessoal** (não corporativa) no GitHub
- Sincronize só `70-career/` para lá
- Nunca conecte Devin a este repo

## Parte 5 — Bootstrap dos exemplos

Os arquivos de exemplo (`exemplo-gestor-direto.md`, etc.) ajudam a entender o formato. Quando começar com dados reais:

```bash
# Mover exemplos para archive
mkdir -p 80-archive/examples
git mv 30-stakeholders/exemplo-*.md 80-archive/examples/
git mv 20-projects/exemplo-*.md 80-archive/examples/
git mv daily/2026-04-27.md 80-archive/examples/
git commit -m "chore: arquivar exemplos após popular com dados reais"
git push
```

## Parte 6 — Daily flow

Veja [DAILY-FLOW.md](DAILY-FLOW.md) para o ciclo de uso no dia a dia.

## Troubleshooting

**Obsidian Git "permission denied":**
- Verifique sua chave SSH no GitHub corporativo, ou troque para HTTPS + Personal Access Token

**Dataview não renderiza tabelas:**
- Confira que o plugin está ativado em Community Plugins
- Recarregue o vault (Cmd/Ctrl+R)

**Devin não consegue acessar o repo:**
- Verifique que a TI liberou Devin como aplicação OAuth na sua org
- Verifique que o repo está visível para o Devin (privado é OK desde que com permissão)

**Arquivos de `70-career/` aparecem no `git status`:**
- O `.gitignore` não está funcionando. Confira que está na raiz do repo. Rode `git check-ignore -v 70-career/qualquer-arquivo.md` para diagnosticar.
