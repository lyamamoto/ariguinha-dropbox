# !arch-update — Update Architecture Documentation

**Macro:** `!arch-update`
**When to use:** When adding new services, changing infrastructure, updating data flows, or reflecting any architectural change in existing documentation.

---

## Goal

Update `architecture.jsonld` and its HTML visualization to reflect architectural changes, maintaining the single-source-of-truth principle.

## Procedure

### Step 1: Edit `architecture.jsonld` (the canonical source)
- Add, modify, or remove the relevant sections.
- For new services: add to the appropriate domain's `arch:services` array with all required fields (`@id`, `@type`, `name`, `arch:port`, `arch:protocol`, `arch:technology`, `arch:status`, `description`, `arch:dependsOn`).
- For status changes: update `arch:status` (e.g., `planned` → `implemented`).
- For removed components: either delete the entry or set `arch:status` to `deprecated`.

### Step 2: Add changelog entry
Add a new entry to `arch:changelog` with:
- Version bump (follow semver — see Knowledge K-16)
- Today's date
- Author
- List of changes

### Step 3: Sync embedded JSON-LD in HTML
Copy the updated `architecture.jsonld` content into the `<script id="arch-data">` tag in `index.html`. The embedded copy must match the standalone file exactly.

### Step 4: Update ARCH_CONFIG (if structural changes)
If new nodes were added to the graph:
- Add positions to `NODE_POSITIONS`
- Add edges to `GRAPH_CONNECTIONS`

If new domains were added:
- Add `.domain-{name}` styles in `colors.css`
- Add entry to `DOMAIN_MAP` and `DOMAIN_COLORS`

If new flows were added:
- Add entry to `FLOW_COLORS`

### Step 5: Validate
```bash
npx ajv validate -s architectures/{system-name}/schema.json -d architectures/{system-name}/architecture.jsonld
```

### Step 6: Verify rendering
Open `index.html` in browser and check that changes render correctly.

## Specifications
- `architecture.jsonld` (standalone file) and embedded copy in `index.html` are identical.
- Changelog has a new entry with correct version bump.
- New nodes appear correctly in the graph without overlapping existing nodes.
- Status filter correctly shows/hides updated nodes.

## Advice
- Always edit the `.jsonld` file first, then sync to HTML. Never edit the embedded copy directly.
- When adding a planned service, position it in the graph where it will logically sit once implemented.
- If removing a service, consider setting it to `deprecated` first (with a changelog note) rather than deleting it — this preserves architectural history.

## Forbidden Actions
- Do NOT edit the embedded JSON-LD in `index.html` without also updating the standalone `.jsonld` file.
- Do NOT skip the changelog entry.
- Do NOT modify `styles.css` or `render.js` (shared files) for project-specific changes — use `colors.css` and `ARCH_CONFIG` instead.
