# !arch-create — Create Architecture Documentation for a System

**Macro:** `!arch-create`
**When to use:** When creating interactive architecture documentation for a new system or documenting an existing system's architecture for the first time.

---

## Goal

Produce a complete, self-contained architecture visualization (JSON-LD + HTML) for a system, following the PREMISES.md standards.

## Required from user

Before starting, confirm with the user:
- System name (used for directory name and header)
- Which services/components exist (names, ports, protocols, technologies)
- How they connect (dependencies, data flows)
- Which are implemented vs planned

## Procedure

### Step 1: Create project directory
```bash
mkdir -p architectures/{system-name}
```

### Step 2: Copy template files
```bash
cp architectures/template-example/index.html architectures/{system-name}/
cp architectures/template-example/schema.json architectures/{system-name}/
```
Do NOT copy `styles.css` or `render.js` — they stay at the root and are referenced via `../`.

### Step 3: Build `architecture.jsonld`
Use `template-example/architecture.jsonld` as a structural reference. Fill in order:

1. **Metadata:** `@context`, `@id`, `@type`, `name`, `description`, `version: "1.0.0"`.
2. **Infrastructure:** databases, message brokers, caches — each with `@id`, `@type`, `name`, `arch:port`, `arch:technology`, `arch:status`.
3. **Domains and services:** group services by bounded context. Each service needs: `@id`, `name`, `arch:port`, `arch:protocol`, `arch:technology`, `arch:status`, `description`, `arch:dependsOn`, `arch:endpoints` (for APIs).
4. **External systems:** third-party integrations with `arch:integrationPoints`.
5. **Frontend:** SPA/mobile apps with `arch:connects`.
6. **Data flows:** end-to-end flows with step-by-step `from`/`to`/`protocol`/`data`.
7. **Optional sections:** decisions (ADRs), SLA, security, observability, resilience, localDev, testing — add based on what's known.
8. **Changelog:** initial entry with version 1.0.0.

### Step 4: Create `colors.css`
Use `template-example/colors.css` as reference:
- Define theme tokens for both dark and light themes (`--bg`, `--fg`, `--accent`, etc.).
- Define `.domain-{name}` styles for each domain in the JSON-LD.
- Each domain gets a distinct OKLCH hue (≥40° separation).

### Step 5: Customize `index.html`
- Update `<title>` and header (logo letter, system name).
- Define `ARCH_CONFIG`:
  - `NODE_POSITIONS`: position every service, infra, external, and frontend node. Organize by layer (External → Workers → Infra → Services → Frontend).
  - `GRAPH_CONNECTIONS`: define all edges between nodes.
  - `DOMAIN_MAP`: map each domain name to its CSS class.
  - `DOMAIN_COLORS`: map each CSS class to its color value.
  - `CONN_STYLES`: define visual styles per connection type (REST, gRPC, SQL, AMQP, etc.).
  - `FLOW_COLORS`: assign accent colors to each data flow.
- Embed the JSON-LD: replace `<script id="arch-data">` content with the full `architecture.jsonld`.

### Step 6: Validate
```bash
npx ajv validate -s architectures/{system-name}/schema.json -d architectures/{system-name}/architecture.jsonld
```

### Step 7: Verify rendering
- Open `architectures/{system-name}/index.html` in a browser.
- Check all 12 tabs render correctly.
- Check status filter works (implemented/planned/all).
- Check node click opens detail panel with correct metadata.
- Check flow graphs render edges correctly.
- Check both dark and light themes.

## Specifications
- `architecture.jsonld` validates against `schema.json`.
- HTML opens correctly via `file://` (no CORS errors).
- No data is hardcoded in JS or HTML — everything comes from JSON-LD.
- `styles.css` and `render.js` are referenced via `../`, not copied.
- Both dark and light themes render with adequate contrast.
- Main graph nodes are positioned without overlap.

## Advice
- Start with just the required sections (infrastructure, domains/services, changelog). Add optional sections incrementally.
- For the main graph layout, sketch the topology on paper first: external systems on the left, infrastructure on the bottom, services in the middle, frontend on the right.
- Run `!arch-update` (not this playbook) when updating an existing architecture.
- For existing projects, combine with `!ppm-bootstrap`: the architecture documentation can be generated alongside the PPM setup since much of the same information is needed (services, tech stack, dependencies).

## Forbidden Actions
- Do NOT copy `styles.css` or `render.js` into the project directory.
- Do NOT hardcode data in the HTML or JS that should come from the JSON-LD.
- Do NOT use `fetch()` for local files — the HTML must work with `file://`.
- Do NOT create domain node styles with colors that are too close in hue (maintain ≥40° separation).
