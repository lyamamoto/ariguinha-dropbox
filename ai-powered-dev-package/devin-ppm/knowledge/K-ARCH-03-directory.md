# K-17: Architecture Directory Structure

**Trigger:** When creating architecture documentation for a new system, when adding files to `architectures/`, or when referencing shared vs project-specific files.

**Content:**

```
architectures/
├── PREMISES.md                    # Shared rules (read-only reference)
├── styles.css                     # Shared CSS — NEVER duplicated into project dirs
├── render.js                      # Shared JS engine — NEVER duplicated into project dirs
├── template-example/              # Minimal working reference (copy from here)
│   ├── architecture.jsonld
│   ├── colors.css
│   ├── index.html
│   └── schema.json
├── {system-name}/                 # One directory per system
│   ├── architecture.jsonld        # Canonical data source (THE source of truth)
│   ├── colors.css                 # Project-specific: theme tokens + domain node styles
│   ├── index.html                 # Project-specific: HTML shell + ARCH_CONFIG + embedded JSON-LD
│   └── schema.json                # JSON schema (copy from template-example)
```

**Critical rules:**
- `styles.css` and `render.js` are shared — live at `architectures/` root, referenced via `../styles.css` and `../render.js`. NEVER copy them into project directories.
- `colors.css` is project-specific — defines theme tokens (dark/light), domain node styles, accent color.
- `index.html` references shared files via `../`, embeds JSON-LD via `<script type="application/ld+json">`, and defines `ARCH_CONFIG` (node positions, connections, domain mapping).
- The HTML must work without a web server (`file://` protocol), without CDN dependencies, without a build step.
