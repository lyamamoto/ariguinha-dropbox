# !ppm-refinement — Phase 2: Backlog Refinement

**Macro:** `!ppm-refinement`
**When to use:** After Assessment (Phase 1), before Sprint Planning. Updates all framework artifacts to reflect current reality.

---

## Goal

After this phase, every PPM document is accurate and up-to-date. The backlog is groomed and re-prioritized.

## Procedure

### Step 1: Update status documents
Based on Phase 1 findings:
- Update `status/project-status.md` — component health, gaps, half-done items.
- Update `testing/coverage.md` — new test counts, new gaps.

### Step 2: Close previous sprint
In the previous sprint file:
- Set final status for all tasks: Done / Deferred (with reason) / Carried over.
- Write sprint retrospective: what went well, what to improve, action items.
- Update `roadmap/roadmap.md` sprint status to `Done`.

### Step 3: Process new requirements
For any new business requirements, bugs, or discoveries from Phase 1 Step 4:
- Create or update epic if it's a new capability.
- Create feature file with stories and acceptance criteria.
- Derive tasks into team backlogs with `Source` links.
- For bugs: create task with `Source: BUG-NNN`.

### Step 4: Update existing requirements
For features that evolved during implementation:
- Update acceptance criteria if behavior intentionally changed.
- Check off completed ACs.
- Update feature status (Planned → In Progress → Done).

### Step 5: Groom backlog
Review all `Planned` and `Deferred` tasks:
- **Remove** tasks no longer relevant (delete, don't defer).
- **Split** tasks that are too large.
- **Merge** tasks that are trivially related.
- **Update** descriptions for tasks with improved understanding.
- **Carry over** incomplete tasks from previous sprint (update status, add notes about why).

### Step 6: Re-prioritize
Update `backlog/prioritization.md`:
- Score new tasks (Value / Effort / Risk).
- Re-score tasks whose context changed.
- Update dependency graph for new blockers.
- Regenerate priority queue (ordered list).

## Specifications
- After this phase, all documents reflect current truth.
- Every task in backlog has a valid `Source` reference.
- `prioritization.md` has an up-to-date scoring table and priority queue.
- Previous sprint file has a completed retrospective.

## Advice
- When processing new requirements, create the requirement FIRST, then derive tasks. Never create orphan tasks.
- When splitting tasks, keep the original ID for the first part and create new IDs for the split-off parts.
- Re-scoring is important — effort estimates often change dramatically after a sprint of implementation.
- The retrospective doesn't need to be long. Even 3 bullet points per section is valuable.

## Forbidden Actions
- Do NOT select tasks for the next sprint yet — that's Phase 3.
- Do NOT delete tasks without removing their references from requirements.
