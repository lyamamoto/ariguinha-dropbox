# K-15: Architecture Documentation Model (JSON-LD)

**Trigger:** When creating or editing `architecture.jsonld` files, when adding services, infrastructure, or data flows to the architecture documentation.

**Content:**

Architecture data lives in a JSON-LD file (`architecture.jsonld`). The HTML visualization consumes this data — never duplicates it. If it's not in the JSON-LD, it must not appear in the HTML.

**Required sections (minimum valid architecture):**
- `@context`, `@id`, `@type` — JSON-LD metadata
- `name`, `description`, `version` — System identification (semver)
- `arch:infrastructure` — Databases, message brokers, caches
- `arch:domains` (with `arch:services`) — Business domains and microservices
- `arch:changelog` — Version history of the document

**Optional sections (adopt as needed):**
- `arch:externalSystems` — Third-party integrations
- `arch:dataFlows` — End-to-end flow descriptions with steps
- `arch:frontend` — Frontend applications
- `arch:deploymentConsiderations` — Scaling, topology
- `arch:decisions` — Architecture Decision Records
- `arch:sla` — Latency, throughput, availability
- `arch:security` — AuthN, AuthZ, encryption
- `arch:observability` — Logging, metrics, tracing, health checks
- `arch:resilience` — Retry, circuit breaker, fallbacks
- `arch:localDev` — Dev setup, docker-compose, startup order
- `arch:testing` — Coverage, gaps, strategy per service

**Status values for every node:** `implemented` | `planned` | `deprecated`. Documentation must reflect current reality, not aspirations.
