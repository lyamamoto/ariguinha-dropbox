# K-09: Foundations Layer

**Trigger:** When creating or editing files inside `foundations/`, when documenting tech stack, coding standards, integration contracts, data governance, or ADRs.

**Content:**

Foundations define HOW the project is built. They are prescriptive and stable.

**Key files and what they contain:**
- **tech-stack.md:** Languages & frameworks (with versions), infrastructure (DBs, brokers, caches), tooling, constraints (licensing, compliance)
- **coding-standards.md:** Naming conventions, formatting (tool + rules), required/banned patterns, code review criteria
- **directory-structure.md:** Canonical tree with purpose, ownership, and constraints per directory
- **reuse-policy.md:** Shared code boundary, dependency direction, versioning strategy, cross-team contribution process
- **integration-contracts.md:** Per integration point: channel, contract/schema, delivery guarantees, ownership
- **data-governance.md:** Schema ownership, migration strategy/tool, retention/TTLs, sensitive data classification

**ADR template** (`foundations/adrs/adr-NNN-<slug>.md`):
```markdown
# ADR-NNN: <Title>

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** <who decided>

## Context
## Decision
## Alternatives Considered
## Consequences
```
