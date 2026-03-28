# !ppm-planning — Phase 3: Sprint Planning

**Macro:** `!ppm-planning`
**When to use:** After Refinement (Phase 2). This is the commitment point — we decide what goes into the next sprint.

---

## Goal

Select tasks for the next sprint, define the sprint goal, create the test plan, and write the sprint file.

## Procedure

### Step 1: Determine sprint capacity
- Check historical velocity (tasks completed in previous sprints).
- Account for team availability (vacations, other commitments).
- Account for carry-over load (incomplete tasks from last sprint).
- **Rule of thumb:** plan at 70-80% of historical velocity to leave room for unknowns.

### Step 2: Select tasks from priority queue
Read `backlog/prioritization.md` and walk the queue top-down (scoring formula: **K-PPM-06**):
1. Take the highest-priority task.
2. Check dependencies: are they Done or also selected for this sprint?
   - Yes → include it.
   - No → skip it, or include the dependency first.
3. Check team capacity:
   - Has room → include it.
   - Full → stop for that team.
4. Repeat until sprint is full.

**Balance rules:**
- Every sprint SHOULD have at least one task delivering **visible user value** (not just infra/refactoring).
- If a P1 task is blocked by dependencies, pull the blockers into this sprint even if lower priority.
- `[shared]` tasks count toward the consuming team's capacity (rules: **K-PPM-10**).

### Step 3: Define sprint goal
- Write 1-2 sentences: the theme and primary outcome.
- Good: "Enable real-time risk monitoring so traders can operate within limits."
- Bad: "Do T-ENG-051, T-ENG-052, T-RET-012."

### Step 4: Create test plan
For each selected task, extract ACs from the source requirement:

| Test | Type | Source AC | Status |
|------|------|----------|--------|
| <test description> | Unit/Integration/E2E | F-NNN/US-NNN.N/AC-N | Pending |

- Every AC of every selected task MUST have at least one test.
- Identify test type: unit, integration, E2E, manual.
- If test requires unavailable infrastructure, note as blocker.

### Step 5: Write sprint file
- Create `roadmap/sprints/sprint-NNN.md` (format: **K-PPM-07**).
- Include: goal, duration, status, task table (task format: **K-PPM-04**), test plan, empty retro section.
- Ensure all task IDs follow naming conventions (**K-PPM-02**).

### Step 6: Update roadmap
- Add new sprint row to `roadmap/roadmap.md`.

### Step 7: Create sprint branch
- After the sprint plan is approved by the user (branching model: **K-GIT-01**):
  ```bash
  git checkout main          # (or develop — whatever the team's trunk branch is)
  git pull
  git checkout -b sprint/{NNN}
  git push -u origin sprint/{NNN}
  ```
- This branch is the integration target for all feature branches during the sprint.

## Specifications
- Sprint file exists with all sections populated (except retrospective).
- Every task in sprint has a test plan entry for each of its ACs.
- Sprint goal is a meaningful sentence, not a task list.
- `roadmap/roadmap.md` reflects the new sprint.
- Branch `sprint/{NNN}` exists and is pushed to origin.

## Advice
- When in doubt about capacity, err on the side of fewer tasks. It's better to finish early and pull from backlog than to carry over half the sprint.
- If you can't fit any P1 tasks because of dependencies, that's a signal that the dependency chain needs attention.
- Present the sprint plan to the user for approval before considering it committed.

## Forbidden Actions
- Do NOT include tasks whose dependencies are not Done or in this sprint.
- Do NOT plan at 100% capacity — always leave buffer.
