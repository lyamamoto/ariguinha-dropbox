# Project & Portfolio Management Framework

**Version:** 1.0
**Purpose:** Generic, deterministic framework for planning, tracking and governing software projects and multi-project portfolios. Designed for AI-assisted development with human readability.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Framework Structure](#2-framework-structure)
3. [Layer 1 — Foundations](#3-layer-1--foundations)
4. [Layer 2 — Requirements](#4-layer-2--requirements)
5. [Layer 3 — Backlog](#5-layer-3--backlog)
6. [Layer 4 — Prioritization](#6-layer-4--prioritization)
7. [Layer 5 — Roadmap & Sprints](#7-layer-5--roadmap--sprints)
8. [Layer 6 — Testing](#8-layer-6--testing)
9. [Layer 7 — Status](#9-layer-7--status)
10. [Multi-Project Governance](#10-multi-project-governance)
11. [Traceability Model](#11-traceability-model)
12. [File Naming & Organization](#12-file-naming--organization)
13. [AI Agent Instructions](#13-ai-agent-instructions)

---

## 1. Overview

This framework organizes project governance into **7 layers**, each feeding the next:

```
Foundations → Requirements → Backlog → Prioritization → Roadmap/Sprints → Testing → Status
     L1           L2           L3           L4                L5              L6       L7
```

**Core principles:**
- **Traceability**: every artifact links back to its origin (epic → feature → story → task → test)
- **Separation of concerns**: requirements say *what*, backlog says *how*, roadmap says *when*
- **Team autonomy with consolidated visibility**: each team owns its backlog; portfolio view aggregates
- **Git as version control**: no in-document versioning; git history is the changelog
- **Requirements are unified by feature** (front+back together); tasks are separated by team/layer

---

## 2. Framework Structure

For a multi-project portfolio, the directory layout is:

```
docs/ppm/
├── framework.md                          # THIS FILE — generic rules
├── foundations/
│   ├── coding-standards.md               # Code conventions, linting, formatting
│   ├── directory-structure.md            # Project organization rules
│   ├── reuse-policy.md                   # Shared code strategy, DRY boundaries
│   ├── tech-stack.md                     # Languages, frameworks, versions, constraints
│   ├── integration-contracts.md          # Protocols, message formats, API contracts
│   ├── data-governance.md                # Data ownership, schemas, retention, migrations
│   └── adrs/                             # Architecture Decision Records
│       ├── _template.md
│       └── adr-NNN-<slug>.md
├── requirements/
│   ├── domain-model.md                   # Ubiquitous language, glossary, entity relationships
│   ├── functional/
│   │   ├── epics.md                      # All epics with IDs (E-NNN)
│   │   ├── <domain>/                     # One dir per bounded context / team domain
│   │   │   ├── F-NNN-<feature-slug>.md   # Feature spec with stories + acceptance criteria
│   │   │   └── ...
│   │   └── cross-cutting/                # Features spanning multiple domains
│   │       └── F-NNN-<feature-slug>.md
│   └── non-functional/
│       ├── sla.md                        # Latency, throughput, availability, consistency, RTO/RPO
│       ├── security.md                   # AuthN, AuthZ, network, TLS, secrets, API, audit, privacy
│       ├── observability.md              # Logging, metrics, tracing, health, dashboards, alerting
│       ├── resilience.md                 # Circuit breaker, fallback, backpressure, idempotency, reconnection
│       ├── ux.md                         # Design system, a11y, performance budget, responsive, i18n
│       └── operations.md                 # CI/CD, deploy strategy, environments, IaC, backup/DR
├── backlog/
│   ├── <team>/                           # One dir per team (e.g., engine, sales, retail, admin)
│   │   ├── functional.md                 # Tasks derived from functional requirements
│   │   └── non-functional.md             # Tasks derived from non-functional requirements
│   └── prioritization.md                 # Scoring matrix + dependency graph + priority queue
├── roadmap/
│   ├── roadmap.md                        # High-level timeline, milestones, sprint overview
│   └── sprints/
│       └── sprint-NNN.md                 # Sprint plan with tasks, goals, test plan
├── testing/
│   ├── strategy.md                       # Test pyramid, what to test at each level, tooling
│   └── coverage.md                       # Current coverage status per module
└── status/
    └── project-status.md                 # What's built, what's pending, qualitative assessment
```

For a **single project**, flatten the `backlog/<team>/` level — use `backlog/functional.md` and `backlog/non-functional.md` directly.

---

## 3. Layer 1 — Foundations

Foundations define *how* the project is built. They are **prescriptive** (rules to follow) and **stable** (change infrequently).

### 3.1 Coding Standards (`foundations/coding-standards.md`)

Document the following:

| Section | Content |
|---------|---------|
| Language conventions | Naming (PascalCase, camelCase, snake_case per context), file naming |
| Formatting | Indentation, line length, tool (Prettier, dotnet format, etc.) |
| Patterns | Required patterns (e.g., Repository, CQRS, Outbox) with examples |
| Anti-patterns | Explicitly banned approaches with rationale |
| Code review criteria | What reviewers check for |

### 3.2 Directory Structure (`foundations/directory-structure.md`)

Document the canonical directory tree for the project/monorepo. For each directory:
- **Purpose**: what belongs here
- **Ownership**: which team owns it
- **Constraints**: what does NOT belong here

### 3.3 Reuse Policy (`foundations/reuse-policy.md`)

Define:
- **Shared code boundary**: when to extract to shared lib vs. duplicate
- **Dependency direction**: who can depend on whom (e.g., apps → libs, never libs → apps)
- **Versioning**: how shared libs evolve (monorepo = implicit, packages = semver)
- **Cross-team contribution**: process for adding to shared code

### 3.4 Tech Stack (`foundations/tech-stack.md`)

| Dimension | Content |
|-----------|---------|
| Languages & Frameworks | With version constraints (e.g., .NET 9, React 19) |
| Infrastructure | Databases, message brokers, caches — with justification |
| Tooling | Build tools, CI runners, deployment targets |
| Constraints | Licensing, compliance, vendor lock-in boundaries |

### 3.5 Integration Contracts (`foundations/integration-contracts.md`)

For each integration point between modules/services:

```
## <Producer> → <Consumer>

- **Channel**: Redis Stream / Kafka topic / HTTP / WebSocket / gRPC
- **Contract**: message schema or API contract (reference to spec or inline)
- **Guarantees**: at-least-once / exactly-once / best-effort
- **Ownership**: who owns the contract, who adapts on breaking changes
```

### 3.6 Data Governance (`foundations/data-governance.md`)

| Section | Content |
|---------|---------|
| Schema ownership | Which team owns which schemas/tables |
| Migration strategy | Tool (EF Migrations, Flyway), process (who runs, when) |
| Data retention | TTLs, archival policy, legal requirements |
| Sensitive data | Classification, encryption at rest, masking rules |

### 3.7 Architecture Decision Records (`foundations/adrs/`)

Use the following template (`_template.md`):

```markdown
# ADR-NNN: <Title>

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** <who decided>

## Context
<What is the problem or situation that requires a decision?>

## Decision
<What is the decision and why?>

## Alternatives Considered
<What other options were evaluated and why were they rejected?>

## Consequences
<What are the positive and negative consequences of this decision?>
```

---

## 4. Layer 2 — Requirements

Requirements define *what* the system must do (functional) and *how well* it must do it (non-functional).

### 4.1 Domain Model (`requirements/domain-model.md`)

Define the **ubiquitous language** of the project:

```markdown
## Glossary

| Term | Definition | Bounded Context |
|------|-----------|-----------------|
| Asset | An atomic tradeable entity (e.g., BTC, ETH) | Securities |
| Deal | A completed transaction between parties | Execution |

## Entity Relationships

<Diagram or textual description of how core entities relate>
```

This document is the shared vocabulary. All requirements, backlog items, and code must use these terms consistently.

### 4.2 Functional Requirements

Functional requirements follow a **3-level hierarchy** with full traceability:

#### Level 1 — Epics (`requirements/functional/epics.md`)

Epics are high-level system capabilities. They answer: "What can the system do?"

```markdown
## E-001: Order Execution

**Description:** System enables submission, routing, filling and tracking of orders across venues.
**Owner:** Engine team
**Features:** F-001, F-002, F-003
**Status:** In Progress | Complete | Planned
```

#### Level 2 — Features (`requirements/functional/<domain>/F-NNN-<slug>.md`)

Features are scoped capabilities within an epic. They answer: "What does this module do?"

Each feature is **unified across layers** (backend + frontend described together).

```markdown
# F-001: Real-time Order Blotter

**Epic:** E-001 (Order Execution)
**Owner:** Engine team
**Status:** Complete | In Progress | Planned

## Description
<What this feature does, from the user's perspective. 2-5 sentences.>

## User Stories

### US-001.1: View open orders
**As a** trader
**I want to** see all my open orders updating in real-time
**So that** I can monitor execution progress

**Acceptance Criteria:**
- [ ] AC-1: Blotter displays all open orders with columns: symbol, side, qty, price, status, time
- [ ] AC-2: Status updates arrive within 200ms of order state change (no page refresh)
- [ ] AC-3: Blotter supports sorting by any column
- [ ] AC-4: Blotter filters by status (open, filled, cancelled)

**Derived Tasks:** T-ENG-042, T-ENG-043 (see backlog)

### US-001.2: Cancel an order
...
```

**Rules:**
- One file per feature
- Stories within the feature file (not separate files)
- Acceptance criteria are testable assertions (maps directly to test cases)
- `Derived Tasks` links to backlog items for traceability
- Features that span teams go in `cross-cutting/`

#### Level 3 — User Stories (embedded in Features)

User stories follow the standard format: As a / I want to / So that.
Each story has numbered acceptance criteria (AC-N) that become test cases.

### 4.3 Non-Functional Requirements

Each NFR file follows this structure:

```markdown
# <Category> Requirements

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

#### 4.3.1 SLA (`requirements/non-functional/sla.md`)

Cover these dimensions:

| Dimension | What to Specify |
|-----------|----------------|
| **Latency** | p50, p95, p99 per endpoint/flow category |
| **Throughput** | Requests/sec, messages/sec per service |
| **Availability** | Uptime target (99.9%, 99.95%, etc.) per service tier |
| **Consistency** | Eventual vs. strong consistency per data domain |
| **Durability** | Data loss tolerance, replication guarantees |
| **Recovery** | RTO (time to recover) and RPO (data loss window) per service |

#### 4.3.2 Security (`requirements/non-functional/security.md`)

| Dimension | What to Specify |
|-----------|----------------|
| **Authentication** | Provider, protocols (OAuth2, OIDC, JWT), session management |
| **Authorization** | Model (RBAC, ABAC), permission granularity, enforcement points |
| **Network Policies** | Service mesh, ingress/egress rules, network segmentation |
| **TLS** | Where enforced, certificate management, minimum TLS version |
| **Secrets Management** | Vault/KMS strategy, rotation policy, no secrets in code |
| **API Security** | Rate limiting, input validation, CORS, OWASP compliance |
| **Audit Trail** | What actions are logged, retention, tamper-proof storage |
| **Data Privacy** | PII classification, LGPD/GDPR compliance, masking, right to deletion |
| **Dependency Security** | CVE scanning, SBOM, supply chain verification |

#### 4.3.3 Observability (`requirements/non-functional/observability.md`)

| Dimension | What to Specify |
|-----------|----------------|
| **Logging** | Format (structured JSON), levels, correlation IDs, retention |
| **Metrics** | What to measure (RED: Rate/Error/Duration), tooling, aggregation |
| **Tracing** | Distributed tracing (OpenTelemetry), sampling rate, span naming |
| **Health Checks** | Liveness vs. readiness, dependencies checked, endpoints |
| **Dashboards** | Required dashboards per service, who owns them |
| **Alerting** | Alert rules, severity levels, escalation, notification channels |

#### 4.3.4 Resilience (`requirements/non-functional/resilience.md`)

| Dimension | What to Specify |
|-----------|----------------|
| **Circuit Breaker** | Thresholds, half-open behavior, per-dependency configuration |
| **Fallbacks** | Degraded behavior when dependency fails, stale data policy |
| **Rate Limiting** | Per-client, per-endpoint, global limits |
| **Resource Isolation** | Bulkheads, thread pool separation, connection pool limits |
| **Reconnection** | Backoff strategy, max attempts, resubscription after reconnect |
| **Backpressure** | Producer-consumer speed mismatch handling, buffering strategy |
| **Idempotency** | Which operations must be idempotent, deduplication mechanism |
| **Graceful Degradation** | What keeps working when each dependency fails |

#### 4.3.5 UX (`requirements/non-functional/ux.md`)

| Dimension | What to Specify |
|-----------|----------------|
| **Design System** | Component library, tokens (colors, spacing, typography), theming |
| **Accessibility (a11y)** | WCAG level target, screen reader support, keyboard navigation |
| **Performance Budget** | Bundle size limits, LCP/FID/CLS targets, lazy loading strategy |
| **Responsive** | Breakpoints, device targets, mobile-first vs. desktop-first |
| **Internationalization** | Locales supported, RTL support, date/number formatting |
| **Error UX** | Error states, empty states, loading states, offline behavior |

#### 4.3.6 Operations (`requirements/non-functional/operations.md`)

| Dimension | What to Specify |
|-----------|----------------|
| **CI/CD** | Pipeline stages, gating criteria, artifact management |
| **Deploy Strategy** | Rolling / blue-green / canary, rollback procedure |
| **Environments** | Dev, staging, prod definitions, parity requirements |
| **Infrastructure as Code** | Tool (Terraform, Pulumi, CDK), module structure |
| **Backup & DR** | Backup frequency, restore testing, failover procedure |
| **Runbooks** | Operational procedures for common incidents |

---

## 5. Layer 3 — Backlog

Backlog transforms requirements into **actionable tasks** owned by specific teams.

### 5.1 Task Format

Each task in the backlog files follows this format:

```markdown
### T-<TEAM>-NNN: <Task Title>

**Source:** F-NNN / US-NNN.N / AC-N | NFR-NNN / AC-N
**Tags:** [shared] [frontend] [backend] [infra] [migration]
**Status:** Planned | In Progress | Done | Blocked | Deferred
**Sprint:** S-NNN | Unscheduled
**Depends on:** T-XXX-NNN (optional)
**Blocks:** T-XXX-NNN (optional)

**Description:**
<What needs to be implemented. Technical details, not business language.>

**Definition of Done:**
- [ ] Code implemented and compiling
- [ ] Tests passing (unit + integration as applicable)
- [ ] Acceptance criteria from source requirement verified
```

### 5.2 Team Backlogs (`backlog/<team>/`)

Each team has two backlog files:
- `functional.md` — tasks from functional requirements
- `non-functional.md` — tasks from non-functional requirements

**Shared code tasks:** when a task requires changes to shared libraries, it appears in the **consuming team's backlog** tagged with `[shared]`. This avoids orphan shared tasks with no consumer.

Example:
```markdown
### T-ENG-051: Add WebSocket reconnection to shared hub [shared]

**Source:** NFR-012 / AC-2
**Tags:** [shared] [backend]
...
```

### 5.3 Task ID Convention

Format: `T-<TEAM>-NNN`

| Team Code | Team |
|-----------|------|
| ENG | Engine (trader-backend, trader-web) |
| SAL | Sales (sales-backend, sales-web) |
| RET | Retail (retail-backend, retail-web) |
| ADM | Admin (admin-web) |
| PLT | Platform / Cross-cutting |

Numbering is sequential per team, never reused. Gaps are acceptable.

---

## 6. Layer 4 — Prioritization

### 6.1 Scoring Dimensions

Each unscheduled task is scored on three dimensions:

| Dimension | Scale | Description |
|-----------|-------|-------------|
| **Value** | 1-5 | Business impact if done. 5 = critical feature / compliance / revenue. 1 = nice-to-have. |
| **Effort** | 1-5 | Implementation cost. 5 = weeks of work / high complexity. 1 = trivial change. |
| **Risk** | 1-5 | Impact if NOT done. 5 = system failure / legal exposure. 1 = no consequence. |

### 6.2 Priority Score

```
Priority Score = (Value × 2 + Risk × 2) / Effort
```

Higher score = higher priority. The formula weights value and risk equally and penalizes high-effort items, surfacing high-impact/low-effort wins.

### 6.3 Priority Classes

After scoring, tasks are classified:

| Class | Score Range | Meaning |
|-------|------------|---------|
| **P1 — Critical** | ≥ 6.0 | Must be in next sprint |
| **P2 — High** | 4.0–5.9 | Should be scheduled within 2 sprints |
| **P3 — Medium** | 2.0–3.9 | Schedule when capacity allows |
| **P4 — Low** | < 2.0 | Backlog parking lot, revisit quarterly |

### 6.4 Dependency Constraints

Priority score determines *desirability*. Dependencies determine *feasibility*:

- A task **cannot** be scheduled before its `Depends on` tasks
- When dependencies conflict with priority, the dependency wins (pull the blocker up)
- Document the dependency graph in `backlog/prioritization.md`

### 6.5 Prioritization File (`backlog/prioritization.md`)

```markdown
# Prioritization Matrix

**Last updated:** YYYY-MM-DD

## Scoring

| Task ID | Title | Value | Effort | Risk | Score | Class | Depends On | Blocks |
|---------|-------|-------|--------|------|-------|-------|------------|--------|
| T-ENG-051 | WS reconnection | 4 | 2 | 4 | 8.0 | P1 | — | T-RET-012 |
| T-SAL-033 | Spread CRUD | 3 | 3 | 2 | 3.3 | P3 | T-ENG-051 | — |

## Dependency Graph

<ASCII or mermaid diagram showing critical paths>

## Priority Queue (ordered)

1. T-ENG-051 (P1, no deps)
2. T-RET-012 (P1, after T-ENG-051)
3. ...
```

---

## 7. Layer 5 — Roadmap & Sprints

### 7.1 Roadmap (`roadmap/roadmap.md`)

The roadmap is a **high-level timeline** showing milestones and sprint themes:

```markdown
# Roadmap

| Sprint | Theme | Key Deliverables | Target Date | Status |
|--------|-------|-----------------|-------------|--------|
| S-006 | Risk Activation | Risk engine, limits CRUD, alerts | 2026-03-01 | Done |
| S-007 | gRPC PDS | Price Distribution Service | 2026-03-15 | In Progress |
| S-008 | LP Config | Persistent LP configuration | 2026-04-01 | Planned |

## Milestones

- **MVP**: S-001 through S-005 — basic trading flow end to end
- **V1 GA**: S-006 through S-010 — production-ready with risk + monitoring
- **V2**: S-011+ — multi-venue, advanced algos, backtesting
```

### 7.2 Sprint Plans (`roadmap/sprints/sprint-NNN.md`)

Each sprint file:

```markdown
# Sprint NNN: <Theme>

**Goal:** <1-2 sentence sprint goal>
**Duration:** <start date> → <end date>
**Status:** Planned | In Progress | Done

## Tasks

| Task ID | Title | Owner | Status | Notes |
|---------|-------|-------|--------|-------|
| T-ENG-051 | WS reconnection | Engine | Done | |
| T-RET-012 | Retail WS gateway | Retail | In Progress | Blocked by T-ENG-051 |

## Test Plan

<What will be tested in this sprint — derived from acceptance criteria of included tasks>

| Test | Type | Source AC | Status |
|------|------|----------|--------|
| WS reconnects within 5s | Integration | NFR-012/AC-2 | Pass |
| Retail gateway streams prices | E2E | F-020/US-020.1/AC-1 | Pending |

## Sprint Retrospective

<Filled after sprint completion>
- **What went well:**
- **What to improve:**
- **Action items:**
```

---

## 8. Layer 6 — Testing

### 8.1 Test Strategy (`testing/strategy.md`)

Define the test pyramid and philosophy:

```markdown
# Test Strategy

## Test Pyramid

| Level | Scope | Tooling | Owned By | Target Coverage |
|-------|-------|---------|----------|----------------|
| Unit | Single class/function | xUnit, vitest | Developer | 80%+ business logic |
| Integration | Module + dependencies | TestContainers, supertest | Developer | Critical paths |
| E2E | Full user flow | Playwright, manual | QA / Developer | Happy paths + edge cases |
| Contract | API compatibility | Pact, OpenAPI validation | Producer | All public APIs |
| Performance | Load / latency | k6, BenchmarkDotNet | Platform | SLA targets |

## What to Test

- **Always test:** Business logic, state transitions, edge cases, error paths
- **Selectively test:** Infrastructure wiring, configuration loading
- **Never test:** Framework internals, trivial getters/setters, generated code

## Test Naming Convention

<project-specific convention, e.g., MethodName_Scenario_ExpectedResult>
```

### 8.2 Coverage Status (`testing/coverage.md`)

```markdown
# Test Coverage Status

**Last updated:** YYYY-MM-DD

## Summary

| Module | Unit | Integration | E2E | Notes |
|--------|------|-------------|-----|-------|
| Execution.Domain | 92% | — | — | |
| Execution.Application | 78% | 4 tests | — | OrderService needs more |
| Sales.Api | — | 12 tests | 2 flows | |
| trader-web | — | — | 3 flows | |

## Coverage Gaps (linked to backlog)

| Gap | Module | Missing | Backlog Task |
|-----|--------|---------|-------------|
| Risk engine edge cases | Execution | Leverage checks | T-ENG-088 |
```

---

## 9. Layer 7 — Status

### 9.1 Project Status (`status/project-status.md`)

A living document showing the qualitative state of the project:

```markdown
# Project Status

**Last updated:** YYYY-MM-DD

## Component Health

| Component | Maturity | Quality | Notes |
|-----------|----------|---------|-------|
| Execution Engine | Production-ready | Good | 92% test coverage, all SLAs met |
| Sales Backend | Beta | Fair | Missing pagination, manual quote creation |
| Retail Gateway | Alpha | Fair | WebSocket stable, REST pending |
| trader-web | Beta | Good | UI complete, a11y pending |

## What's Built (summary)

<Brief description of completed capabilities — reference sprints for details>

## Known Gaps

<Categorized list of gaps with backlog task references>

## Half-done Items

<Things that were started but not completed, with remaining work described>
```

**Maturity levels:**
- **Prototype**: proof of concept, not for production
- **Alpha**: core functionality works, gaps remain, no SLA
- **Beta**: feature-complete for V1 scope, some gaps, partial SLA
- **Production-ready**: SLAs met, tested, monitored, documented

---

## 10. Multi-Project Governance

When managing multiple related projects (e.g., Engine, Sales, Retail in a monorepo):

### 10.1 Shared vs. Project-Specific

| Layer | Shared? | Notes |
|-------|---------|-------|
| Foundations | Mostly shared | Coding standards, tech stack, directory structure are monorepo-wide. ADRs can be project-specific. |
| Domain Model | Shared | Single glossary, each project adds its bounded context terms |
| Functional Requirements | Per project | Organized by `<domain>/` directory. Cross-cutting features in `cross-cutting/` |
| Non-Functional Requirements | Shared defaults + project overrides | e.g., latency SLA is 200ms by default, but 50ms for pricing |
| Backlog | Per team | Each team owns its backlog. `[shared]` tag for shared lib work |
| Prioritization | Consolidated | Single priority matrix across all teams |
| Roadmap | Consolidated | Single roadmap, sprint tasks can span teams |
| Testing | Strategy shared, coverage per project | Test pyramid is monorepo-wide, coverage tracked per module |
| Status | Per project + consolidated | Component health per module, rollup to portfolio status |

### 10.2 Cross-Project Features

When a feature spans multiple projects (e.g., "retail client sees real-time quotes"):

1. The feature file lives in `requirements/functional/cross-cutting/`
2. Derived tasks are created in **each team's backlog** with cross-references
3. All tasks for the feature share the same sprint (or explicit sequencing across sprints)
4. The feature is not "Done" until ALL derived tasks across teams are done

### 10.3 Shared Code Governance

Tasks tagged `[shared]` follow these rules:
- The **consuming team** creates and owns the task
- The task description specifies what changes are needed in the shared lib
- If multiple teams need the same shared change, the first team to need it owns the task; others add a `Depends on` reference
- Shared code changes require review from at least one other consuming team (in practice, validated by the AI agent checking for breaking changes)

---

## 11. Traceability Model

Every artifact in the framework links to its parent and children:

```
Epic (E-NNN)
  └── Feature (F-NNN)
        └── User Story (US-NNN.N)
              └── Acceptance Criteria (AC-N)
                    ├── Task (T-TEAM-NNN)  →  Sprint (S-NNN)
                    └── Test Case          →  Coverage Report

NFR (NFR-NNN)
  └── Acceptance Criteria (AC-N)
        ├── Task (T-TEAM-NNN)  →  Sprint (S-NNN)
        └── Test Case          →  Coverage Report
```

**Traceability rules:**
1. Every task MUST have a `Source` linking to a requirement (F-NNN/US/AC or NFR-NNN/AC)
2. Every acceptance criterion SHOULD map to at least one test case
3. Every feature MUST belong to an epic
4. Every scheduled task MUST be in a sprint
5. Orphan tasks (no source requirement) are not allowed — create the requirement first

**Reverse traceability (impact analysis):**
- To find all tasks for a requirement: search backlog for `Source: F-NNN` or `Source: NFR-NNN`
- To find the sprint for a task: check `Sprint` field in task
- To find test coverage for a requirement: follow AC → test case → coverage report

---

## 12. File Naming & Organization

### 12.1 Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Epic ID | `E-NNN` | E-001 |
| Feature ID | `F-NNN` | F-042 |
| Feature file | `F-NNN-<kebab-slug>.md` | `F-042-real-time-blotter.md` |
| User Story ID | `US-NNN.N` | US-042.1 |
| Acceptance Criteria | `AC-N` (within story) | AC-3 |
| NFR ID | `NFR-NNN` | NFR-015 |
| Task ID | `T-<TEAM>-NNN` | T-ENG-051 |
| Sprint ID | `S-NNN` | S-007 |
| Sprint file | `sprint-NNN.md` | `sprint-007.md` |
| ADR ID | `ADR-NNN` | ADR-003 |
| ADR file | `adr-NNN-<kebab-slug>.md` | `adr-003-price-ladder.md` |

### 12.2 Cross-Reference Syntax

When referencing artifacts across files, use this format:
- In-line: `E-001`, `F-042`, `T-ENG-051`, `S-007`, `NFR-015`, `ADR-003`
- With link: `[F-042](../requirements/functional/engine/F-042-real-time-blotter.md)`

### 12.3 Status Values

All status fields use these values consistently:

| Status | Meaning |
|--------|---------|
| **Planned** | Defined but not started |
| **In Progress** | Actively being worked on |
| **Blocked** | Cannot proceed (state reason) |
| **Done** | Completed and verified |
| **Deferred** | Explicitly postponed (state reason and revisit date) |

---

## 13. AI Agent Instructions

When an AI agent (e.g., Claude Code) operates within this framework, it MUST follow these rules:

### 13.1 Creating New Requirements

1. Check if an appropriate epic exists; if not, create one in `epics.md`
2. Create the feature file in the correct domain directory
3. Write user stories with testable acceptance criteria
4. Create derived tasks in the appropriate team's backlog with `Source` links
5. Add tasks to `prioritization.md` with scores

### 13.2 Planning a Sprint

1. Read `prioritization.md` to get the priority queue
2. Respect dependency constraints (no task before its dependencies)
3. Balance effort across teams (no team overloaded)
4. Create sprint file with tasks, test plan derived from acceptance criteria
5. Update `roadmap.md` with the new sprint

### 13.3 After Implementation

1. Mark tasks as Done in the team's backlog
2. Update sprint file task status
3. Update `coverage.md` with new test counts
4. Update `project-status.md` if component maturity changed
5. Mark acceptance criteria as checked in the feature file

### 13.4 Replanning (per iteration)

At the start of each new iteration:
1. Review status of all In Progress and Blocked tasks
2. Re-score any tasks whose Value, Effort, or Risk has changed
3. Re-evaluate dependency graph for new blockers
4. Propose next sprint based on updated priority queue
5. Update roadmap with any timeline shifts

### 13.5 Searching & Navigation

- To find what to build next: read `backlog/prioritization.md`
- To find what a feature requires: read the feature file (`F-NNN-*.md`)
- To find sprint scope: read `roadmap/sprints/sprint-NNN.md`
- To find current state: read `status/project-status.md`
- To find test gaps: read `testing/coverage.md`
- To find architectural decisions: read `foundations/adrs/`
- To understand terms: read `requirements/domain-model.md`

---

## Appendix A — Checklist for Applying This Framework to a New Project

1. [ ] Copy `docs/ppm/` directory structure
2. [ ] Fill `foundations/tech-stack.md` with technology choices
3. [ ] Fill `foundations/coding-standards.md` with conventions
4. [ ] Fill `foundations/directory-structure.md` with project layout
5. [ ] Define `requirements/domain-model.md` glossary
6. [ ] Write epics in `requirements/functional/epics.md`
7. [ ] Create domain directories under `requirements/functional/`
8. [ ] Write feature files with stories and acceptance criteria
9. [ ] Define non-functional requirements per category
10. [ ] Derive tasks into team backlogs with source links
11. [ ] Score and prioritize in `backlog/prioritization.md`
12. [ ] Plan first sprint in `roadmap/sprints/sprint-001.md`
13. [ ] Define test strategy in `testing/strategy.md`
14. [ ] Create initial `status/project-status.md`

---

## Appendix B — Framework Adaptation Guide

This framework is designed to be generic. When applying to specific contexts:

| Context | Adaptation |
|---------|-----------|
| **Single developer** | Skip team codes in task IDs, use flat backlog |
| **No sprints (Kanban)** | Replace sprint files with a WIP board in `roadmap/kanban.md` |
| **Microservices** | One domain directory per service in requirements |
| **Monolith** | One domain directory per module/bounded context |
| **Frontend-only** | Drop integration contracts, emphasize UX NFRs |
| **Backend-only** | Drop UX NFRs, emphasize SLA and resilience |
| **Regulated industry** | Expand security + audit, add compliance section to NFRs |
| **Startup / MVP** | Focus on epics + P1 tasks only, defer NFRs except security basics |
