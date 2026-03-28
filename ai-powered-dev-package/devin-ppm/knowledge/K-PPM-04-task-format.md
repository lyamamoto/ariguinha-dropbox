# K-04: Task Format

**Trigger:** When creating new tasks in backlog files, when editing task status, when deriving tasks from requirements.

**Content:**

Every task in `backlog/<team>/functional.md` or `non-functional.md` uses this format:

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

**Rules:**
- Shared code tasks appear in the **consuming team's** backlog tagged `[shared]`
- Description uses technical language (how), not business language (what)
- Source field is mandatory — no orphan tasks
