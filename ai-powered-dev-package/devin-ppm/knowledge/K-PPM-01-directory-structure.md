# K-01: PPM Directory Structure

**Trigger:** When creating files inside `docs/ppm/`, when setting up a new project's PPM structure, or when navigating PPM documentation.

**Content:**

The PPM framework uses this directory layout under `docs/ppm/`:

```
docs/ppm/
├── framework.md                          # Generic rules (read-only reference)
├── foundations/
│   ├── coding-standards.md
│   ├── directory-structure.md
│   ├── reuse-policy.md
│   ├── tech-stack.md
│   ├── integration-contracts.md
│   ├── data-governance.md
│   └── adrs/
│       ├── _template.md
│       └── adr-NNN-<slug>.md
├── requirements/
│   ├── domain-model.md
│   ├── functional/
│   │   ├── epics.md
│   │   ├── <domain>/
│   │   │   └── F-NNN-<feature-slug>.md
│   │   └── cross-cutting/
│   │       └── F-NNN-<feature-slug>.md
│   └── non-functional/
│       ├── sla.md
│       ├── security.md
│       ├── observability.md
│       ├── resilience.md
│       ├── ux.md
│       └── operations.md
├── backlog/
│   ├── <team>/
│   │   ├── functional.md
│   │   └── non-functional.md
│   └── prioritization.md
├── roadmap/
│   ├── roadmap.md
│   └── sprints/
│       └── sprint-NNN.md
├── testing/
│   ├── strategy.md
│   └── coverage.md
└── status/
    └── project-status.md
```

For a **single project**, flatten: use `backlog/functional.md` and `backlog/non-functional.md` directly (no `<team>/` subdirectory).

Features spanning multiple teams go in `requirements/functional/cross-cutting/`.
