# K-06: Prioritization Formula

**Trigger:** When scoring tasks, updating prioritization.md, deciding what to schedule next, or planning a sprint.

**Content:**

Each unscheduled task is scored on 3 dimensions (1-5 scale):
- **Value:** Business impact if done. 5 = critical/revenue. 1 = nice-to-have.
- **Effort:** Implementation cost. 5 = weeks/high complexity. 1 = trivial.
- **Risk:** Impact if NOT done. 5 = system failure/legal. 1 = no consequence.

**Formula:** `Priority Score = (Value × 2 + Risk × 2) / Effort`

**Priority Classes:**

| Class | Score | Meaning |
|-------|-------|---------|
| P1 — Critical | ≥ 6.0 | Must be in next sprint |
| P2 — High | 4.0–5.9 | Within 2 sprints |
| P3 — Medium | 2.0–3.9 | When capacity allows |
| P4 — Low | < 2.0 | Backlog parking lot, revisit quarterly |

**Dependency constraints override priority:** a task cannot be scheduled before its `Depends on` tasks. When dependencies conflict with priority, pull the blocker up.

**prioritization.md** must contain: scoring table, dependency graph (ASCII or mermaid), and ordered priority queue.
