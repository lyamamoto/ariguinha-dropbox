# K-16: Architecture Naming & IDs

**Trigger:** When creating IDs for services, infrastructure, domains, flows, ADRs, or external systems in `architecture.jsonld`.

**Content:**

| Element | ID Pattern | Example |
|---------|-----------|---------|
| Architecture file | `architecture.jsonld` | Always this name |
| Color palette | `colors.css` | Always this name, per project |
| Directory | `architectures/{system-name}/` | `architectures/my-system/` |
| JSON-LD IDs | `arch:{category}/{slug}` | `arch:service/order-service` |
| Status values | Lowercase enum | `implemented`, `planned`, `deprecated` |
| ADR IDs | `arch:adr/{NNN}` | `arch:adr/001` |
| Infrastructure IDs | `arch:infra/{name}` | `arch:infra/main-db` |
| Domain IDs | `arch:domain/{name}` | `arch:domain/core` |
| Flow IDs | `arch:flow/{slug}` | `arch:flow/order-creation` |
| External IDs | `arch:external/{name}` | `arch:external/email-provider` |
| Frontend IDs | `arch:frontend/{name}` | `arch:frontend/web-app` |

**JSON-LD @context:**
```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "arch": "https://example.com/architecture#"
  }
}
```

**Changelog versioning (semver):**
- MAJOR: Breaking changes (domain split, service removal)
- MINOR: New services, sections, integrations
- PATCH: Corrections, port changes, description updates
