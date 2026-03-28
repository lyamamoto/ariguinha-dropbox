# K-10: Multi-Project Governance

**Trigger:** When working in a monorepo with multiple teams/projects, when handling cross-cutting features, or when managing shared code tasks.

**Content:**

**What is shared vs. project-specific:**

| Layer | Shared? |
|-------|---------|
| Foundations (coding standards, tech stack, dir structure) | Shared (monorepo-wide) |
| Domain Model | Shared (single glossary, each project adds its terms) |
| Functional Requirements | Per project (by `<domain>/` dir). Cross-cutting in `cross-cutting/` |
| Non-Functional Requirements | Shared defaults + project overrides |
| Backlog | Per team. `[shared]` tag for shared lib work |
| Prioritization | Consolidated (single matrix across all teams) |
| Roadmap | Consolidated (single roadmap, tasks can span teams) |
| Testing strategy | Shared. Coverage tracked per module |
| Status | Per project + consolidated rollup |

**Cross-project feature rules:**
1. Feature file lives in `requirements/functional/cross-cutting/`
2. Derived tasks created in EACH team's backlog with cross-references
3. All tasks share the same sprint (or explicit sequencing)
4. Feature is not "Done" until ALL derived tasks across teams are Done

**Shared code (`[shared]` tag) rules:**
- Consuming team creates and owns the task
- If multiple teams need same shared change, first team owns it; others add `Depends on`
- Shared changes require review from at least one other consuming team
