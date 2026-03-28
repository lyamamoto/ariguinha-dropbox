# K-08: Non-Functional Requirements Format

**Trigger:** When creating or editing NFR files (sla.md, security.md, observability.md, resilience.md, ux.md, operations.md).

**Content:**

Each NFR follows this template:

```markdown
## NFR-NNN: <Requirement Title>

**Category:** SLA | Security | Observability | Resilience | UX | Operations
**Priority:** Must Have | Should Have | Nice to Have
**Applies to:** All services | <specific services>
**Measurable Target:** <quantitative target if applicable>

### Description
<What is required and why>

### Acceptance Criteria
- [ ] AC-1: <testable assertion>
- [ ] AC-2: ...

### Derived Tasks
T-ENG-XXX, T-SAL-XXX (see backlog)
```

**NFR categories and key dimensions:**
- **SLA:** Latency (p50/p95/p99), throughput, availability, consistency, durability, RTO/RPO
- **Security:** AuthN, AuthZ, network policies, TLS, secrets, API security, audit, data privacy
- **Observability:** Logging, metrics (RED), tracing (OpenTelemetry), health checks, dashboards, alerting
- **Resilience:** Circuit breaker, fallbacks, rate limiting, bulkheads, reconnection, backpressure, idempotency
- **UX:** Design system, a11y (WCAG), performance budget (LCP/FID/CLS), responsive, i18n, error states
- **Operations:** CI/CD, deploy strategy, environments, IaC, backup/DR, runbooks
