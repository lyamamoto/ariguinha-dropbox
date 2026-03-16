# Architecture Documentation Premises

Standards and principles for building structured, machine-readable architecture documentation
with interactive visualization. This document defines the **template construction model** —
follow these premises when creating architecture documentation for any system.

See `template-example/` for a minimal working reference that implements all premises.

---

## P1: Single Source of Truth

All architecture data lives in a **JSON-LD file** (`architecture.jsonld`).
The HTML visualization **consumes** this data — it never duplicates it.

- If something is not in the JSON-LD, it must not appear in the HTML.
- If you need to add a new service, flow, or decision — edit the JSON-LD first; the HTML re-renders automatically.
- The HTML embeds the JSON-LD via `<script type="application/ld+json">` for `file://` compatibility. The standalone `.jsonld` file is the **canonical source**; the embedded copy must be kept in sync.

## P2: Honest Status Tracking

Every node (service, infrastructure, feature) carries an explicit `arch:status`:

| Status | Meaning |
|--------|---------|
| `implemented` | In production or fully functional in development |
| `planned` | Designed but not yet implemented |
| `deprecated` | Being phased out, still exists in code |

Documentation must reflect **current reality**, not aspirations. Planned items are clearly
marked as such. Mock implementations (e.g., mock auth) are documented as mock — not as
complete features.

### Visual Representation of Status
- **Implemented** nodes render with solid borders and full opacity.
- **Planned** nodes render with `border-style: dashed` and reduced opacity (~0.7).
- **Deprecated** nodes should be visually dimmed or struck-through.
- A **global status filter** (dropdown) lets users filter the graph and services by `implemented`, `planned`, or `all`.

## P3: Machine-Readable + Human-Readable

Two formats serve two audiences:

- **JSON-LD** (`architecture.jsonld`) — Machine format. Validates against `schema.json`. Can be consumed by CI/CD pipelines, auditing tools, dependency graphs, or other systems. Uses JSON-LD `@context` with `arch:` vocabulary prefix.
- **HTML** (`index.html`) — Human format. Interactive visualization for teams. Renders all data dynamically from the embedded JSON-LD.

Both derive from the same data. Neither contains information the other doesn't.

## P4: Self-Contained Visualization

The visualization must work:

- **Without a web server** — opens via `file://` protocol in any browser
- **Without external CDN dependencies** — no unpkg, cdnjs, or Google Fonts
- **Without a build step** — no npm, webpack, or compilation required

### Modular file structure:

The visualization is split into **5 files**, with shared files living at the `architectures/` root:

| File | Location | Role | Reusable? |
|------|----------|------|-----------|
| `styles.css` | `architectures/` | Layout, components, animations | Yes — shared, single copy |
| `render.js` | `architectures/` | Generic JS rendering engine (all 12 tabs) | Yes — shared, single copy |
| `colors.css` | `{system}/` | Theme tokens (dark/light), domain node styles, logo gradient | No — project-specific |
| `index.html` | `{system}/` | HTML shell + embedded JSON-LD + `ARCH_CONFIG` | No — project-specific |
| `architecture.jsonld` | `{system}/` | Canonical data source | No — project-specific |

**Why this works with `file://`**: `<link rel="stylesheet" href="../styles.css">` and `<script src="../render.js">` are loaded by the browser's HTML parser (not by `fetch()`), so they work fine on `file://`. Only `fetch()` and `XMLHttpRequest` are blocked by CORS on `file://`.

### `index.html` structure:

```html
<link rel="stylesheet" href="../styles.css" />   <!-- shared CSS (from parent) -->
<link rel="stylesheet" href="colors.css" />       <!-- project-specific colors -->

<!-- HTML shell: header + 12 tab sections -->

<script type="application/ld+json" id="arch-data">
  { /* embedded copy of architecture.jsonld */ }
</script>

<script>
  // ARCH_CONFIG: project-specific visual config
  window.ARCH_CONFIG = {
    NODE_POSITIONS: { ... },     // hand-tuned graph layout
    GRAPH_CONNECTIONS: [ ... ],  // main graph edges
    DOMAIN_MAP: { ... },         // domain name → CSS class
    DOMAIN_COLORS: { ... },      // CSS class → color value
    CONN_STYLES: { ... },        // connection type → stroke style
    FLOW_COLORS: { ... }         // flow name → accent color
  };
</script>
<script src="../render.js"></script>              <!-- shared engine (from parent) -->
```

### Rules:
- No `fetch()` calls to local files
- `styles.css` and `render.js` live at `architectures/` root — **never duplicated** into project dirs
- Projects reference them via `../styles.css` and `../render.js`
- `colors.css` defines theme tokens (`--accent`, `--bg`, `--fg`, etc.) and `.domain-{name}` node styles
- `ARCH_CONFIG` in `index.html` defines graph layout, connections, domain-to-CSS mapping, and flow colors

## P5: Modular Schema

The JSON-LD schema is designed in sections that can be adopted **incrementally**.

### Required sections (minimum valid architecture)

| Section | Purpose |
|---------|---------|
| `@context`, `@id`, `@type` | JSON-LD metadata |
| `name`, `description`, `version` | System identification |
| `arch:infrastructure` | Databases, message brokers, caches |
| `arch:domains` (with `arch:services`) | Business domains and their microservices |
| `arch:changelog` | Version history of this document |

### Optional sections (adopt as needed)

| Section | Purpose |
|---------|---------|
| `arch:externalSystems` | Third-party integrations and partner systems |
| `arch:dataFlows` | End-to-end data flow descriptions |
| `arch:frontend` | Frontend applications |
| `arch:deploymentConsiderations` | Scaling, topology, infrastructure mapping |
| `arch:decisions` | Architecture Decision Records (ADRs) |
| `arch:sla` | Non-functional requirements (latency, throughput, availability) |
| `arch:security` | Authentication, authorization, encryption, secrets |
| `arch:observability` | Logging, metrics, tracing, health checks, alerting |
| `arch:resilience` | Retry policies, circuit breakers, fallbacks, DLQ |
| `arch:localDev` | Development setup, docker-compose, startup order, env vars |
| `arch:testing` | Test strategy per service, coverage, gaps |

A minimal architecture for a simple service might only need the required sections.
A production system should aim to cover all optional sections as well.

## P6: Template Reusability

The `schema.json`, HTML rendering engine, and CSS theme are designed to work with
**any system's** `architecture.jsonld` — not just a specific project.

### To create documentation for a new system:

1. **Create directory** under `architectures/`
2. **Copy `index.html`** from `template-example/` as a starting point
3. **Copy `schema.json`** from `template-example/`
4. **Create `colors.css`** defining theme tokens and domain node styles (see `template-example/colors.css`)
5. **Create `architecture.jsonld`** with your system's data
6. **Customize `index.html`**: update header, define `ARCH_CONFIG` (positions, connections, domain mapping), embed JSON-LD
7. **Validate** with `npx ajv validate -s schema.json -d architecture.jsonld`
8. **Open** `index.html` in a browser

### Directory convention:

```
architectures/
├── PREMISES.md                    # This file (shared across all architectures)
├── styles.css                     # Shared CSS — NEVER duplicated
├── render.js                      # Shared JS engine — NEVER duplicated
├── template-example/              # Minimal working reference
│   ├── architecture.jsonld        # Example data
│   ├── colors.css                 # Example project colors
│   ├── index.html                 # Example HTML shell with ARCH_CONFIG
│   └── schema.json                # JSON schema
├── {system-name}/                 # One directory per system
│   ├── architecture.jsonld        # Canonical data source
│   ├── colors.css                 # Project-specific colors + domain styles
│   ├── index.html                 # HTML shell + ARCH_CONFIG + embedded JSON-LD
│   └── schema.json                # Schema (copy from template-example)
```

## P7: Changelog Discipline

Every modification to `architecture.jsonld` **must** add an entry to `arch:changelog`:

```json
{
  "version": "1.2.0",
  "date": "2026-03-14",
  "author": "Team Name",
  "changes": [
    "Added Worker service (planned)",
    "Updated API endpoints with new risk endpoint"
  ]
}
```

Use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to the architecture (domain split, service removal)
- **MINOR**: New services, new sections, new integrations
- **PATCH**: Corrections, port changes, description updates

---

## P8: Domain Color System

Every domain/category of nodes must have a **unique, distinguishable color** in both the graph and legend. Colors are defined in the project's `colors.css` file (see `template-example/colors.css` for reference).

### Rules:
- **Each domain gets one color.** No two domains share the same hue.
- **Frontends are not "external"** — frontend applications (SPAs, mobile apps) get their own distinct domain color, separate from external systems and internal services.
- **Color applies consistently** across: legend dots, node icon backgrounds, node hover borders, topology cards border-left accents, and flow graph nodes.
- **Connection types also have distinct colors and line styles** (solid, dashed, thick) so users can identify the protocol visually.
- Colors should use a perceptually uniform color space (e.g., **OKLCH**) and maintain at least **40° hue separation** between domains.

### `colors.css` — Domain node styles structure:

```css
/* Core — blue */
.domain-core .node-icon { background: oklch(0.65 0.20 260 / 20%); color: oklch(0.65 0.20 260); }
.domain-core .node:hover { border-color: oklch(0.65 0.20 260); }

/* Infrastructure — purple */
.domain-infra .node-icon { background: oklch(0.60 0.18 290 / 20%); color: oklch(0.60 0.18 290); }
.domain-infra .node:hover { border-color: oklch(0.60 0.18 290); }
```

Adapt the domain names and hues to your system. The `ARCH_CONFIG.DOMAIN_MAP` in `index.html` maps JSON-LD domain names to CSS classes (`.domain-{name}`).

## P9: Interactive Architecture Graph

The main system graph is a **positioned node-and-edge diagram** rendered with HTML nodes and SVG connections.

### Node rendering:
- Nodes are `position: absolute` HTML divs inside a `position: relative` canvas.
- Each node shows: **icon** (first letter), **name** (with `text-overflow: ellipsis`, max-width constrained), and **port** (if applicable).
- **Tooltip** on hover shows the full name, port, and description.
- **Click** opens a detail panel below the graph with: protocol badges, technology stack, endpoints, dependencies, entities, streams/topics, and integration points — all read from the node's JSON-LD data.

### Edge rendering:
- Edges are **SVG bezier curves** (`<path>`) drawn inside an `<svg>` overlay that covers the canvas.
- The SVG has `pointer-events: none` so it doesn't block node clicks.
- Each connection type has a distinct visual style (color, dash pattern, stroke width) as defined in `colors.css`.
- **Arrow markers** (`<marker>` with `<polygon>`) indicate direction.
- Connection labels show the protocol or data topic on the edge.

### Hover interactions:
- **Node hover** highlights all connected edges (opacity 1, thicker stroke, animated dash) and dims unconnected edges (opacity 0.1).
- **Mouse leave** restores all edges to default state.

### Hand-tuned vs auto-layout:
- The **main system graph** uses hand-tuned positions (a JS map of `nodeId → {x, y}`). This gives maximum control over the overall topology layout.
- When hand-tuning, organize nodes in logical layers: External → Workers → Infrastructure → Services → Config → Frontend.

## P10: Interactive Flow Diagrams

Each data flow (from `arch:dataFlows`) gets its own **interactive mini-graph** within its flow card. These are not static SVGs — they use the same node/edge rendering as the main graph.

### Topological Column Layout (auto-layout):

Flow graphs use **automatic layout** based on the step sequence:

1. **First-appearance order**: Assign each node an ordinal based on when it first appears in the step list. This determines "forward" vs "backward" direction.
2. **Forward edges**: Edges where `firstAppear[from] < firstAppear[to]`. Only forward edges propagate column depth.
3. **Backward edges**: Edges where `firstAppear[from] >= firstAppear[to]` (cycles). These do NOT affect column assignment.
4. **Column propagation**: Start all nodes at column 0. For each forward edge, set `col[to] = max(col[to], col[from] + 1)`. Iterate until stable.
5. **Gap removal**: Remap column values to sequential 0-based indices (remove empty columns).
6. **Vertical stacking**: Nodes in the same column are centered vertically with uniform spacing.

### Edge routing:
- **Forward edges** (left → right): Exit the right side of the source node, enter the left side of the target. Horizontal bezier control points at ~40% of the horizontal distance.
- **Backward edges** (right → left, cycles): Exit the bottom of the source, curve below both nodes, enter the bottom of the target. The curve's nadir is `max(bottomOfSource, bottomOfTarget) + 30px`.
- **Parallel edge jitter**: When multiple edges connect the same pair of nodes, offset them vertically by 16px increments to prevent overlap.

### Hover-only labels:
- **Protocol and data labels** on flow edges start with `opacity: 0` (CSS class `.flow-label`).
- **Node hover** toggles `.visible` on all labels of edges connected to that node.
- **Edge hover** toggles `.visible` only on that specific edge's labels. This requires the flow SVG to have `pointer-events: auto` (unlike the main graph SVG) and each edge path to have `pointer-events: stroke`.
- **Mouse leave** removes `.visible` from all labels in that SVG.

### Per-flow color theming:
Each flow can have a distinct accent color (defined in a JS map). This color applies to the flow card title, step dots, and internal action borders.

### Deferred rendering (critical for hidden tabs):
- `getBoundingClientRect()` returns `{x:0, y:0, width:0, height:0}` when the parent element has `display: none` (e.g., inactive tab).
- Flow graphs must **not** draw edges during initial render. Instead:
  1. `renderFlows()` generates the HTML structure and stores graph configs in a global variable.
  2. When the Flows tab becomes visible (`switchTab('flows')`), call `mountAllFlowGraphs()`.
  3. `mountAllFlowGraphs()` runs inside `requestAnimationFrame()` and iterates each stored config, rendering nodes and edges with correct positions.
  4. A `_flowGraphsMounted` flag prevents re-mounting on subsequent tab switches.

### Auto-sizing canvas:
- After rendering all nodes, measure actual positions via `getBoundingClientRect()` to compute the true bounding box.
- Set canvas width = `maxRight + padding` and height = `maxBottom + extraPadding` (extra padding if backward edges exist, since they curve below).
- Do **not** use a fixed `min-height` on flow canvases — only the main graph canvas should have `min-height`.

## P11: Overview Topology Cards

The Overview tab includes a **System Topology** section with one card per domain (plus Infrastructure and External Systems).

### Layout rules:
- Cards use `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`.
- This ensures cards expand to fill available space (up to ~25% each on wide screens) while reflowing on narrower viewports.
- Do **not** set `max-width` on the grid container — let it fill the parent.
- Each card has a left border accent matching the domain color.

## P12: Tab-Based Navigation

The visualization uses a **tab bar** in the sticky header. Each tab maps to a `<section class="view">`.

### Standard tabs (in order):

| # | Tab | Data Source | Purpose |
|---|-----|-------------|---------|
| 1 | Overview | Computed from all sections | Stats grid + mini topology cards |
| 2 | Graph | domains + infra + external + frontend | Interactive node-edge topology |
| 3 | Services | domains[].services[] | Filterable table with all services |
| 4 | Flows | dataFlows | Per-flow interactive graphs + step details |
| 5 | Deploy | deploymentConsiderations | Scaling and topology cards |
| 6 | ADRs | decisions | Expand/collapse architecture decision records |
| 7 | SLAs | sla | Latency, throughput, availability cards |
| 8 | Security | security | Current vs Planned two-column layout |
| 9 | Observability | observability | Feature cards with implemented/planned indicators |
| 10 | Resilience | resilience | Pattern cards with status badges |
| 11 | Dev Setup | localDev | Step-by-step guide with code blocks |
| 12 | Testing | testing | Coverage table + gaps list |

### Tab rendering strategy:
- **On init**: Render all tabs except Graph (content generated from JSON-LD and inserted into DOM).
- **Graph tab**: Re-rendered on each switch to it (because the status filter may have changed).
- **Flows tab**: HTML structure rendered on init; edges mounted on first tab switch (deferred rendering per P10).

### Scrollable tab bar:
When many tabs exist, the nav uses `overflow-x: auto` so tabs can scroll horizontally on smaller screens without wrapping.

## P13: OKLCH Theme Design System

All colors use the **OKLCH** color space for perceptual uniformity. Each project defines its full palette (theme tokens + domain node styles) in a `colors.css` file at the project directory level (see `template-example/colors.css`).

### Dual-theme requirement:
Every project must define **both a dark theme and a light theme** in `colors.css`. The active theme is toggled via a class on `<html>` (`.dark` / `.light`). A theme toggle button is provided in the header.

### Token categories:

The `colors.css` must define at minimum:

| Category | Tokens | Guidelines |
|----------|--------|------------|
| **Backgrounds** | `--bg`, `--bg-card`, `--bg-elevated`, `--bg-hover` | Dark: low lightness (0.14–0.25). Light: high lightness (0.93–1.00). Near-zero chroma. |
| **Foreground** | `--fg`, `--fg-muted`, `--fg-dim` | Achromatic (chroma 0). Dark: high lightness. Light: low lightness. |
| **Borders** | `--border`, `--border-strong` | Use alpha transparency (`/ 10%`, `/ 18%`) for theme-agnostic layering. |
| **Effects** | `--radius`, `--shadow`, `--shadow-glow`, `--transition` | Shared between themes. |
| **Accent** | `--accent` | Primary project color — used by `styles.css` for stat values, active tabs, ports, step arrows, etc. |

### CSS structure in `colors.css`:

```css
:root, :root.dark {
  --bg: oklch(0.14 0.008 250);
  --accent: oklch(0.65 0.20 260);
  /* ... all dark tokens ... */
}
:root.light {
  --bg: oklch(0.97 0.005 250);
  /* --accent stays the same or adjusts for contrast */
  /* ... all light tokens ... */
}

/* Domain node styles */
.domain-core .node-icon { background: oklch(0.65 0.20 260 / 20%); color: oklch(0.65 0.20 260); }
.domain-core .node:hover { border-color: oklch(0.65 0.20 260); }

/* Logo gradient */
header .logo { background: linear-gradient(135deg, oklch(0.65 0.20 260), oklch(0.70 0.16 165)); }
```

### Badge system:
Status badges use `background: oklch(... / 15%)` with matching text color for a subtle tinted appearance. Protocol badges (REST, WS, gRPC, Worker, etc.) follow the same pattern.

### Animations:
- `fadeIn` — cards and sections animate in with opacity + translateY.
- `pulse-glow` — optional attention effect using box-shadow animation.
- `dash-flow` — connection highlight uses `stroke-dashoffset` animation for flowing dash effect.

## P14: Node Interaction Design

### Width constraints:
- Nodes have `max-width: 170px` to prevent overly wide cards.
- Node names use `text-overflow: ellipsis` with `overflow: hidden` and `white-space: nowrap`, constrained to `max-width: 110px`.
- The **tooltip** (`title` attribute) shows the full untruncated name, port, and description.

### Click detail panel:
When a node is clicked (in either the main graph or a flow graph), a **detail panel** appears below with:
- **Header**: Full service name + port badge + status badge
- **Subtitle**: Service description
- **Detail grid** (responsive `auto-fit` columns of 280px min): Protocol badges, technology stack, endpoints list, dependencies, entities, streams/topics, integration points, and flow connections (in flow context).

All detail content is read from the node's JSON-LD data — no hardcoded information.

### SVG arrow markers:
- Defined in `<defs>` with one `<marker>` per connection type.
- Flow graphs use **scoped marker IDs** (prefixed with canvas ID) to avoid ID collisions when multiple flow graphs exist on the same page: `id="{canvasId}-arrow-{type}"`.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Architecture file | `architecture.jsonld` | Always this name |
| Color palette | `colors.css` | Always this name, per project |
| Directory | `{system-name}/` | `my-system/` |
| JSON-LD IDs | `arch:{category}/{slug}` | `arch:service/order-service` |
| Status values | Lowercase enum | `implemented`, `planned`, `deprecated` |
| ADR IDs | `arch:adr/{NNN}` | `arch:adr/001` |
| Infrastructure IDs | `arch:infra/{name}` | `arch:infra/main-db` |
| Domain IDs | `arch:domain/{name}` | `arch:domain/core` |
| Flow IDs | `arch:flow/{slug}` | `arch:flow/order-creation` |
| External IDs | `arch:external/{name}` | `arch:external/email-provider` |
| Frontend IDs | `arch:frontend/{name}` | `arch:frontend/web-app` |

## JSON-LD @context

Standard vocabulary prefix:

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "arch": "https://example.com/architecture#"
  }
}
```

All custom properties use the `arch:` prefix. Schema.org vocabulary serves as the base
for standard properties (`name`, `description`, `version`). Replace `example.com` with
your organization's domain.

---

## How to Use This Template

### For a new project

```bash
# 1. Create directory
mkdir -p architectures/my-system

# 2. Copy project-level template files
cp architectures/template-example/index.html architectures/my-system/
cp architectures/template-example/schema.json architectures/my-system/

# 3. Create colors.css defining themes + domain node styles
# Use template-example/colors.css as reference

# 4. Create architecture.jsonld with your system's data
# Use template-example/architecture.jsonld as reference

# 5. Customize index.html:
#    a. Update <title>, header logo letter/title
#    b. Define ARCH_CONFIG: NODE_POSITIONS, GRAPH_CONNECTIONS, DOMAIN_MAP, etc.
#    c. Embed JSON-LD: replace <script id="arch-data"> content
#    Note: styles.css and render.js are already referenced via ../

# 6. Validate
npx ajv validate -s architectures/my-system/schema.json -d architectures/my-system/architecture.jsonld

# 7. View
open architectures/my-system/index.html
```

### For updating existing documentation

1. Edit `architecture.jsonld` (the canonical source)
2. Add a changelog entry with version bump
3. Copy the updated JSON-LD into the HTML `<script id="arch-data">` tag
4. If adding new services to the graph, update `ARCH_CONFIG.NODE_POSITIONS` and `GRAPH_CONNECTIONS`
5. If adding new domains, add `.domain-{name}` styles in `colors.css` and entry in `ARCH_CONFIG.DOMAIN_MAP`/`DOMAIN_COLORS`
6. Validate against schema
7. Open in browser to verify rendering

### For reviewing architecture

1. Open `index.html` in a browser
2. Use tabs to navigate different views
3. Use the status filter to focus on implemented vs planned items
4. Click nodes in the graph for detailed metadata
5. Hover over flow graph nodes/edges to see protocol and data labels
6. Review ADRs in the Decisions tab for context on design choices

---

## Implementation Checklist

When building a new architecture visualization from this template, verify:

- [ ] `colors.css` defines `--accent`, all theme tokens (dark + light), and `.domain-{name}` node styles
- [ ] `index.html` references `../styles.css` and `../render.js` (shared, not duplicated)
- [ ] All 12 tabs render correctly with data from JSON-LD
- [ ] No data is hardcoded in JS — inspect source for string literals
- [ ] Main graph nodes are positioned without overlap
- [ ] Flow graphs auto-layout nodes in topological columns
- [ ] Flow graph edges render correctly (test by switching to Flows tab)
- [ ] Forward edges route left→right; backward edges curve below
- [ ] Hover-only labels appear on node hover and edge hover
- [ ] Status filter works (implemented/planned/all) in both Graph and Services
- [ ] Planned nodes show dashed borders
- [ ] Node click opens detail panel with full metadata
- [ ] Overview topology cards expand to fill available width
- [ ] `schema.json` validates `architecture.jsonld`
- [ ] HTML opens correctly via `file://` (no CORS errors in console)
- [ ] Both dark and light themes render with adequate contrast
