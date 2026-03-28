# K-03: Traceability Model

**Trigger:** When creating tasks, features, test cases, or when linking artifacts together. When checking if a task has a source requirement.

**Content:**

Every artifact links to its parent and children:

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

**Mandatory rules:**
1. Every task MUST have a `Source` linking to a requirement (F-NNN/US/AC or NFR-NNN/AC)
2. Every AC SHOULD map to at least one test case
3. Every feature MUST belong to an epic
4. Every scheduled task MUST be in a sprint
5. Orphan tasks (no source requirement) are NOT allowed — create the requirement first

**Reverse traceability:**
- Find tasks for a requirement: search backlog for `Source: F-NNN` or `Source: NFR-NNN`
- Find sprint for a task: check `Sprint` field
- Find test coverage for a requirement: follow AC → test case → coverage report
