# K-18: Architecture Visualization Rules

**Trigger:** When customizing `index.html`, `colors.css`, or `ARCH_CONFIG` for an architecture visualization. When adding domains, graph nodes, or flow diagrams.

**Content:**

**ARCH_CONFIG** (defined in `index.html <script>`) controls the visual layout:
- `NODE_POSITIONS`: hand-tuned `{nodeId: {x, y}}` for the main graph. Organize in layers: External → Workers → Infrastructure → Services → Config → Frontend.
- `GRAPH_CONNECTIONS`: edges for the main graph.
- `DOMAIN_MAP`: maps JSON-LD domain names to CSS classes (`.domain-{name}`).
- `DOMAIN_COLORS`: CSS class → color value.
- `CONN_STYLES`: connection type → stroke style (solid, dashed, thick).
- `FLOW_COLORS`: flow name → accent color.

**Status visualization:**
- `implemented`: solid borders, full opacity.
- `planned`: dashed borders, reduced opacity (~0.7).
- `deprecated`: visually dimmed.
- A global status filter (dropdown) lets users toggle between implemented/planned/all.

**Domain colors** (in `colors.css`):
- Each domain gets a unique hue. No two domains share the same hue.
- Use OKLCH color space. Maintain ≥40° hue separation between domains.
- Frontends get their own distinct color (not grouped with external systems).
- Color applies consistently across: legend, node icons, hover borders, topology cards, flow graphs.

**Dual theme required:** `colors.css` must define both dark (`:root, :root.dark`) and light (`:root.light`) themes.

**12 standard tabs:** Overview, Graph, Services, Flows, Deploy, ADRs, SLAs, Security, Observability, Resilience, Dev Setup, Testing.
