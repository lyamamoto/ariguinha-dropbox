# !ppm-close — Phase 5: Sprint Close

**Macro:** `!ppm-close`
**When to use:** Last day of the sprint, or when all sprint tasks are completed. Wraps up the sprint and prepares for the next iteration.

---

## Goal

Close the sprint cleanly. Update all tracking documents. Ensure traceability loop is closed. Write retrospective.

## Procedure

### Step 1: Final task review
- Open `roadmap/sprints/sprint-<current>.md` (format: **K-PPM-07**).
- Walk every task:
  - All `Done` tasks have passing tests.
  - All `Done` tasks have Definition of Done items checked in backlog (format: **K-PPM-04**).
  - Incomplete tasks are marked (status values: **K-PPM-02**):
    - `In Progress` → carrying over (will appear in next sprint).
    - `Deferred` → with explicit reason and revisit date.

### Step 2: Close traceability loop (MANDATORY — see **K-PPM-03**)
For each completed task:
1. Open the source feature file (format: **K-PPM-05**) or NFR file (format: **K-PPM-08**).
2. Check off the acceptance criteria that are now verified by passing tests.
3. If ALL ACs of a user story are checked → mark the story as `Done`.
4. If ALL stories of a feature are Done → mark the feature status as `Done`.

This step ensures requirements reflect reality. Skipping it is an anti-pattern (**K-PPM-14**).

### Step 3: Update test coverage
- Update `testing/coverage.md` (status format: **K-PPM-11**):
  - New test counts per module (unit %, integration count, E2E flows).
  - New coverage gaps discovered during sprint → link to backlog tasks.

### Step 4: Update project status
- Update `status/project-status.md` (maturity levels: **K-PPM-11**):
  - Component maturity changes (e.g., Alpha → Beta if feature-complete for V1).
  - New capabilities added to "What's Built" section.
  - Gaps resolved or newly discovered.
  - Update "Half-done Items" if any tasks carried over.

### Step 6: Verify feature PRs (branching model: **K-GIT-01**)
- Check that all `Done` tasks have their feature PRs merged into `sprint/{NNN}`.
- Check that all merged feature branches have been deleted.
- For carried-over tasks: their feature branches remain on the sprint branch (they will be rebased onto the next sprint branch during next planning).
- For deferred tasks: delete their feature branches if they exist.

### Step 7: Update architecture documentation (conditional — playbook: **!arch-update**, knowledge: **K-ARCH-01** through **K-ARCH-04**)
Review the sprint's completed tasks and ask: did any change affect the system architecture?

Triggers for architecture update:
- New service, worker, or infrastructure component added
- Service removed or deprecated
- Communication protocol changed between services
- New data flow or significant change to existing flow
- New external system integration
- Infrastructure change (new database, new message broker, etc.)

If **yes** to any trigger → execute `!arch-update` playbook now:
- Edit `architecture.jsonld` to reflect the changes
- Add changelog entry
- Sync embedded JSON-LD in HTML
- Update `ARCH_CONFIG` if new nodes/connections
- Validate and verify rendering

If **no** → skip this step. Not every sprint changes the architecture.

### Step 8: Write sprint retrospective
Fill the retrospective section in the sprint file:

- **What went well:** Practices to continue.
- **What to improve:** Pain points, inefficiencies.
- **Action items:** Concrete changes for next iteration.

Prompts to consider:
- Did the sprint goal get achieved?
- Was the scope realistic? Over/under-committed?
- Did discoveries cause significant unplanned work?
- Are there recurring blockers needing systemic fixes?
- Did the test plan catch real issues?

### Step 9: Archive, commit, and open sprint PR (PR template: **K-GIT-01**)
- Mark sprint status as `Done` in `roadmap/roadmap.md`.
- Commit all documentation changes to the `sprint/{NNN}` branch.
- Open PR from `sprint/{NNN}` → main branch (or develop).
- PR title: `Sprint {NNN}: {Sprint Goal}`
- PR description must include (template: **K-GIT-01**):
  - Sprint goal
  - Tasks completed (IDs + titles)
  - Tasks deferred/carried over (with reasons)
  - Coverage changes (before → after)
  - Status/maturity changes
  - Architecture changes (yes/no, summary)
  - Retrospective summary (key takeaways)
- Notify the pilot for final review.
- After pilot approval: merge the sprint PR, delete the sprint branch.

## Specifications
- Sprint file has a completed retrospective (even if brief — 3 bullets per section minimum).
- All completed task ACs are checked off in their source requirement files.
- `testing/coverage.md` reflects current reality.
- `status/project-status.md` is up-to-date.
- Sprint is marked `Done` in `roadmap/roadmap.md`.
- All feature PRs are merged into the sprint branch.
- Architecture documentation is updated if any architectural changes occurred.
- Sprint PR is opened from `sprint/{NNN}` → main, with complete description.
- All changes committed to git.

## Advice
- Step 2 (traceability close) is the most commonly skipped step and the most important one. Without it, requirements look permanently incomplete even when features are shipped.
- The retrospective doesn't need to be a novel. 3 bullet points per section is enough. The value is in writing it at all.
- Action items from the retro become inputs to Phase 2 of the next iteration — don't let them disappear.
- If you deferred tasks, always include a reason AND a revisit date. "Deferred" without context becomes "forgotten."
- Step 7 (arch update) is conditional — don't force it. If nothing architectural changed, skip it. But if a new service was added and you skip it, the architecture documentation becomes stale immediately.
- The sprint PR description (Step 9) is the executive summary of the sprint. The pilot should be able to read it and understand everything that happened without opening individual files.

## Forbidden Actions
- Do NOT skip Step 2 (closing ACs in requirement files). This is the traceability guarantee.
- Do NOT skip the retrospective. Even a minimal one prevents repeating mistakes.
- Do NOT leave tasks in ambiguous states — every task must be Done, Deferred (with reason), or explicitly carried over.
- Do NOT merge the sprint PR without pilot approval.
- Do NOT leave orphan feature branches — merge (Done), keep (carry-over), or delete (Deferred).
