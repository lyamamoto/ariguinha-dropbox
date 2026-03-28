# K-02: PPM Naming Conventions & IDs

**Trigger:** When creating epics, features, user stories, tasks, sprints, NFRs, or ADRs. When referencing PPM artifacts by ID.

**Content:**

| Artifact | ID Pattern | File Pattern | Example |
|----------|-----------|-------------|---------|
| Epic | `E-NNN` | (in `epics.md`) | E-001 |
| Feature | `F-NNN` | `F-NNN-<kebab-slug>.md` | F-042, `F-042-real-time-blotter.md` |
| User Story | `US-NNN.N` | (in feature file) | US-042.1 |
| Acceptance Criteria | `AC-N` | (in story, within feature) | AC-3 |
| NFR | `NFR-NNN` | (in category file) | NFR-015 |
| Task | `T-<TEAM>-NNN` | (in team backlog) | T-ENG-051 |
| Sprint | `S-NNN` | `sprint-NNN.md` | S-007 |
| ADR | `ADR-NNN` | `adr-NNN-<kebab-slug>.md` | ADR-003 |

**Team codes:** ENG (Engine), SAL (Sales), RET (Retail), ADM (Admin), PLT (Platform/Cross-cutting). Adapt to your project.

**Rules:**
- Numbering is sequential per type/team, never reused. Gaps OK.
- Cross-reference syntax: in-line `E-001`, with link `[F-042](../requirements/functional/engine/F-042-real-time-blotter.md)`
- All status fields use: `Planned | In Progress | Blocked | Done | Deferred`
