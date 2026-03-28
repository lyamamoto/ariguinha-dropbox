# !ppm-new-requirement — Create a New Requirement

**Macro:** `!ppm-new-requirement`
**When to use:** When the user describes a new feature, capability, or bug that needs to be added to the PPM framework. Can be used during Phase 2 (Refinement) or standalone.

---

## Goal

Transform a user request into a fully traced requirement: epic → feature → stories → ACs → tasks → prioritized.

## Procedure

### Step 1: Check for existing epic
- Read `requirements/functional/epics.md` (ID format: **K-PPM-02**).
- Does this new capability fit under an existing epic?
  - Yes → note the epic ID (E-NNN).
  - No → create a new epic in `epics.md` with the next available ID.

### Step 2: Create feature file
- Determine the domain: which bounded context / team owns this?
- Create `requirements/functional/<domain>/F-NNN-<kebab-slug>.md` (format: **K-PPM-05**, naming: **K-PPM-02**).
- Write the description (user perspective, 2-5 sentences).

### Step 3: Write user stories with acceptance criteria
- Follow "As a / I want to / So that" format (template: **K-PPM-05**).
- Each story gets numbered ACs: `AC-1`, `AC-2`, etc.
- ACs must be **testable assertions** — they will become test cases.
- Leave AC checkboxes unchecked (they get checked when tests pass).

### Step 4: Derive tasks into backlog
For each unchecked AC (traceability rules: **K-PPM-03**):
1. Create a task in the appropriate team's backlog (format: **K-PPM-04**).
2. Set `Source` to the specific `F-NNN / US-NNN.N / AC-N`.
3. Tag: `[shared]`, `[frontend]`, `[backend]`, `[infra]` as appropriate.
4. Set status to `Planned`, sprint to `Unscheduled`.

### Step 5: Add to prioritization
- Score each new task: Value (1-5), Effort (1-5), Risk (1-5) (formula: **K-PPM-06**).
- Add to `backlog/prioritization.md` scoring table.
- Update dependency graph if new dependencies exist.
- Re-sort the priority queue.

### Step 6: Update feature with task references
- Go back to the feature file.
- Add `Derived Tasks: T-XXX-NNN, T-XXX-NNN` under each user story.

## Specifications
- Feature file exists with at least one user story and testable ACs.
- Every AC has at least one corresponding task in backlog.
- Every task has a `Source` field linking back to the feature/story/AC.
- New tasks are scored and appear in `prioritization.md`.
- The feature's epic reference exists in `epics.md`.

## Advice
- If the user gives a vague description, write the feature and ask for confirmation before deriving tasks. It's easier to fix a requirement than to redo tasks.
- For bugs: create task directly with `Source: BUG-NNN` — you don't need a full feature file for bug fixes unless they represent a new capability.
- Don't over-split: one task per AC is usually the right granularity. Only split further if an AC requires work from multiple teams.

## Forbidden Actions
- Do NOT create tasks without a `Source` requirement. The requirement comes first, always.
- Do NOT add new tasks directly to a sprint — they go to backlog as `Planned` and get scheduled in the next Phase 3.
