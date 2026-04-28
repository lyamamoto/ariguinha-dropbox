# Obsidian Visual Setup — Minimal + Style Settings + Iconize

Guia completo de instalação e configuração dos plugins visuais do vault corporativo.

---

## Visão geral

Os três se complementam sem conflito:

| Plugin | Função |
|---|---|
| **Minimal** | Define a base visual — tipografia, cores, espaçamentos |
| **Style Settings** | Expõe controles visuais do Minimal sem editar CSS |
| **Minimal Theme Settings** | Companion do Minimal, adiciona ainda mais controles |
| **Iconize** | Ícones nas pastas e arquivos — independente do tema |

Instale sempre nessa ordem: Minimal → Style Settings → Minimal Theme Settings → Iconize.

---

## Instalação

### 1. Minimal (tema)

```
https://github.com/kepano/obsidian-minimal/releases/latest
```

Baixe nos Assets: `theme.css` + `manifest.json`

Destino:
```
.obsidian/themes/Minimal/
```

Ativar em: **Settings → Appearance → Themes → Minimal**

---

### 2. Style Settings (plugin)

```
https://github.com/mgmeyers/obsidian-style-settings/releases/latest
```

Baixe: `main.js` + `manifest.json`

Destino:
```
.obsidian/plugins/obsidian-style-settings/
```

Após ativar, aparece em **Settings → Style Settings**.

---

### 3. Minimal Theme Settings (plugin companion)

```
https://github.com/kepano/obsidian-minimal-settings/releases/latest
```

Baixe: `main.js` + `manifest.json`

Destino:
```
.obsidian/plugins/obsidian-minimal-settings/
```

Expõe controles extras do Minimal: estilo de checkboxes, cards, imagens, tabelas.

---

### 4. Iconize (plugin)

```
https://github.com/FlorianWoelki/obsidian-iconize/releases/latest
```

Baixe: `main.js` + `manifest.json` + `styles.css`

Destino:
```
.obsidian/plugins/obsidian-iconize/
```

Após instalar: clique com **botão direito** em qualquer pasta no explorer → **"Change icon"**. Usa a biblioteca Lucide por padrão (mesmos ícones do Obsidian nativo).

---

### Atualizar `community-plugins.json`

Após instalar todos, confirme que `.obsidian/community-plugins.json` contém:

```json
[
  "obsidian-git",
  "dataview",
  "templater-obsidian",
  "smart-connections",
  "obsidian-front-matter-title",
  "obsidian-style-settings",
  "obsidian-minimal-settings",
  "obsidian-iconize"
]
```

---

## Ícones recomendados para o vault corporativo

| Pasta | Ícone (Lucide) |
|---|---|
| `00-index` | `home` |
| `10-areas` | `layers` |
| `20-projects` | `rocket` |
| `30-stakeholders` | `users` |
| `40-resources` | `book-open` |
| `50-meetings` | `message-square` |
| `60-decisions` | `scale` |
| `70-career` | `lock` |
| `80-archive` | `archive` |
| `daily` | `calendar` |
| `templates` | `layout-template` |
| `scripts` | `terminal` |
| `docs` | `file-text` |
| `attachments` | `paperclip` |

---

## Aplicar design system corporativo via CSS snippet

O Style Settings ajusta o que o Minimal expõe. Para ir além — cores de brand, fontes corporativas, estilo de tabelas — use CSS snippets.

### Criar o arquivo de snippet

Crie o arquivo:
```
.obsidian/snippets/brand.css
```

Ativar em: **Settings → Appearance → CSS snippets → toggle do arquivo `brand`**

### Estrutura base do `brand.css`

Substitua os valores pelos do seu design system:

```css
/* ============================================================
   brand.css — Design system corporativo
   Adapte as variáveis abaixo para as cores e fontes da empresa
   ============================================================ */

:root {
  /* --------------------------------------------------
     CORES PRINCIPAIS
     -------------------------------------------------- */

  /* Cor de destaque (links, botões, seleções) */
  --color-accent: #0066CC;
  --color-accent-hover: #0052A3;

  /* --------------------------------------------------
     TIPOGRAFIA
     -------------------------------------------------- */

  /* Fonte para texto corrido */
  --font-text: 'Inter', 'Segoe UI', system-ui, sans-serif;

  /* Fonte para títulos (deixe igual à --font-text se não tiver fonte de display) */
  --font-interface: 'Inter', 'Segoe UI', system-ui, sans-serif;

  /* Fonte monoespaçada (código, frontmatter) */
  --font-monospace: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Tamanho base */
  --font-text-size: 15px;

  /* --------------------------------------------------
     CORES DE FUNDO — MODO CLARO
     -------------------------------------------------- */
  --background-primary: #FFFFFF;
  --background-secondary: #F5F7FA;
  --background-modifier-border: #E5E7EB;

  /* --------------------------------------------------
     CORES DE TEXTO — MODO CLARO
     -------------------------------------------------- */
  --text-normal: #1A1A2E;
  --text-muted: #6B7280;
  --text-faint: #9CA3AF;
}

/* Modo escuro — ajuste se necessário */
.theme-dark {
  --background-primary: #1A1A2E;
  --background-secondary: #16213E;
  --background-modifier-border: #2D3748;
  --text-normal: #E2E8F0;
  --text-muted: #A0AEC0;
  --text-faint: #718096;
}
```

---

### Estilizar tabelas (muito útil para índices Dataview)

```css
/* ============================================================
   Tabelas no estilo corporativo
   ============================================================ */

.markdown-rendered table,
.dataview.table-view-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.9em;
  border-radius: 6px;
  overflow: hidden;
}

.markdown-rendered th,
.dataview.table-view-table th {
  background-color: var(--color-accent);
  color: white;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.markdown-rendered td,
.dataview.table-view-table td {
  padding: 8px 14px;
  border-bottom: 1px solid var(--background-modifier-border);
  vertical-align: top;
}

.markdown-rendered tr:hover td,
.dataview.table-view-table tr:hover td {
  background-color: var(--background-secondary);
}
```

---

### Estilizar callouts (avisos e destaques nas notas)

```css
/* ============================================================
   Callouts corporativos
   ============================================================ */

/* Info — azul corporativo */
.callout[data-callout="info"] {
  --callout-color: 0, 102, 204;
}

/* Warning — amarelo */
.callout[data-callout="warning"] {
  --callout-color: 234, 179, 8;
}

/* Danger / blocker — vermelho */
.callout[data-callout="danger"] {
  --callout-color: 220, 38, 38;
}

/* Tip / insight — verde */
.callout[data-callout="tip"] {
  --callout-color: 22, 163, 74;
}

/* Privado — para notas sensíveis */
.callout[data-callout="private"] {
  --callout-color: 107, 114, 128;
  --callout-icon: lock;
}
```

Uso nas notas:
```markdown
> [!info] Título
> Conteúdo informativo

> [!private] Conteúdo sensível
> Não compartilhar fora do vault
```

---

### Estilizar badges de status (frontmatter Properties)

```css
/* ============================================================
   Status badges nos frontmatter properties
   ============================================================ */

/* Campo status do projeto — colorir por valor */
.metadata-property[data-property-key="status"] .metadata-property-value {
  font-weight: 600;
}

/* Campo priority */
.metadata-property[data-property-key="priority"] .metadata-property-value {
  font-family: var(--font-monospace);
  font-size: 0.85em;
}

/* Campo health — sinalização visual */
.metadata-property[data-property-key="health"] .metadata-property-value {
  font-weight: 600;
}
```

---

## Sobre usar um design system CSS existente

### O que o Style Settings faz (e não faz)

Style Settings **não importa CSS externo**. Ele lê variáveis que o Minimal declara e gera controles visuais para elas. Use para ajustar o que o Minimal já expõe: cores de destaque, fontes, espaçamento, largura de notas.

### Três abordagens por complexidade

| Abordagem | Quando usar | Como |
|---|---|---|
| **Só variáveis** (cores + fontes) | Design system com tokens bem definidos | `brand.css` com variáveis CSS |
| **Componentes** (tabelas, callouts, badges) | Quer consistência visual nas notas | Snippets adicionais por componente |
| **Framework externo** (Tailwind, Material) | Não recomendado para ambiente corporativo | `@import url()` — pode ser bloqueado pela rede |

### Recomendação para ambiente corporativo

1. Extraia do design system apenas: cores primárias, fontes, tons de cinza
2. Cole no `brand.css` como variáveis CSS
3. Use Style Settings para o resto (espaçamento, largura, checkboxes)
4. Adicione snippets pontuais para tabelas e callouts

Isso evita dependências externas e mantém o vault funcionando offline — essencial em ambiente corporativo.

---

## Checklist de setup completo

- [ ] Minimal instalado e ativado como tema
- [ ] Style Settings instalado e ativado
- [ ] Minimal Theme Settings instalado e ativado
- [ ] Iconize instalado e ativado
- [ ] `community-plugins.json` atualizado com todos os IDs
- [ ] Ícones configurados nas pastas principais
- [ ] `brand.css` criado em `.obsidian/snippets/` com cores e fontes do design system
- [ ] Snippet ativado em Settings → Appearance → CSS snippets
- [ ] Tabelas Dataview verificadas com novo estilo (abrir `00-index/HOME.md`)
- [ ] Callouts testados com `> [!info]` em uma nota qualquer
