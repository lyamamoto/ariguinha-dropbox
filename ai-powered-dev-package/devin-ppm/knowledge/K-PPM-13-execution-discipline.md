# K-13: Execution Discipline (Sprint Behavior Rules)

**Trigger:** When implementing tasks during a sprint, when picking the next task to work on, when encountering bugs or new ideas mid-sprint, when creating branches or pull requests, or when updating task status after completing work.

**Content:**

These rules govern behavior throughout the entire sprint duration.

**Task execution loop:**
For each task during the sprint:
1. **Branch:** Create `feature/{task-id}-{slug}` from `sprint/{NNN}` (see K-19 for naming).
2. **Read** the source requirement (feature file or NFR) and its acceptance criteria — understand what "done" means.
3. **Implement** following foundations (coding standards, patterns, directory structure). Commit with conventional format: `feat(T-ENG-051): ...`, `test(T-ENG-051): ...`, `fix(T-ENG-051): ...`.
4. **Test:** Write/run tests matching the ACs from the sprint test plan. Mark test status: `Pending → Pass | Fail`. If a test fails, fix the implementation, not the test.
5. **Update status** to `Done` in BOTH the backlog file AND the sprint file immediately.
6. **Open PR** from `feature/{task-id}-{slug}` → `sprint/{NNN}`. PR description must include: task ID, source requirement, ACs verified, tests added (see K-19 for full PR template). Notify the pilot for review.
7. **After pilot approval:** merge the PR, delete the feature branch.
8. **Pick the next task.**

**If task is Blocked or Deferred:** do NOT open a PR. The feature branch stays (for carry-over to next sprint) or is deleted (if deferred). Document the reason in the sprint file.

**Task selection order:** (1) unblocked first, (2) higher priority within unblocked, (3) related tasks together to minimize context-switching.

**Handling discoveries mid-sprint:**

| Discovery | Action |
|-----------|--------|
| Bug in existing code | Create task in backlog with `Source: BUG`. Only add to sprint if P1 blocker to current sprint task. |
| Missing requirement | Note it. Do NOT implement. Goes to backlog for next Phase 2. |
| Task bigger than estimated | Split: finish what's feasible now, new task for remainder. |
| Task trivially easy | Complete, pick next task. Do NOT expand scope. |
| New idea / improvement | Add to backlog as `Planned`. Do NOT implement. |
| Blocker from another team | Mark task `Blocked` with reason, pick another task. |

**Critical rules:**
- Do NOT add unplanned work to the sprint unless it's a P1 blocker to a sprint task. Everything else → backlog.
- Do NOT implement beyond the acceptance criteria (gold-plating is an anti-pattern).
- Do NOT modify acceptance criteria to match your implementation — flag for discussion if AC seems wrong.
- Do NOT skip writing tests. Every AC must have a corresponding test.
- Update status as you go — don't batch for sprint close.
