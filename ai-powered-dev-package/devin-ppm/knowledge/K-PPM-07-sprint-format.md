# K-07: Sprint File Format

**Trigger:** When creating or editing sprint files, planning sprints, or closing sprints.

**Content:**

Sprint files live at `roadmap/sprints/sprint-NNN.md`:

```markdown
# Sprint NNN: <Theme>

**Goal:** <1-2 sentence sprint goal — the WHY, not a task list>
**Duration:** <start date> → <end date>
**Status:** Planned | In Progress | Done

## Tasks

| Task ID | Title | Owner | Status | Notes |
|---------|-------|-------|--------|-------|
| T-ENG-051 | WS reconnection | Engine | Done | |
| T-RET-012 | Retail WS gateway | Retail | In Progress | Blocked by T-ENG-051 |

## Test Plan

| Test | Type | Source AC | Status |
|------|------|----------|--------|
| WS reconnects within 5s | Integration | NFR-012/AC-2 | Pass |
| Retail gateway streams prices | E2E | F-020/US-020.1/AC-1 | Pending |

## Sprint Retrospective

- **What went well:**
- **What to improve:**
- **Action items:**
```

**Rules:**
- Sprint goal is a theme sentence, NOT a task list. Good: "Enable real-time risk monitoring." Bad: "Do T-ENG-051, T-ENG-052."
- Every AC of every selected task MUST have at least one test in the test plan
- Retrospective is filled at sprint close (Phase 5)
- Also update `roadmap/roadmap.md` with the new sprint row
