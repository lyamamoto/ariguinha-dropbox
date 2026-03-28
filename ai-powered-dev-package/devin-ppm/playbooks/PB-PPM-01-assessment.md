# !ppm-assessment — Phase 1: Sprint Assessment

**Macro:** `!ppm-assessment`
**When to use:** At the start of each iteration, before any planning. This is a read-only phase.

---

## Goal

Understand where the project stands RIGHT NOW. No decisions yet — just gather information.

## Procedure

### Step 1: Review previous sprint
- Read `roadmap/sprints/sprint-<latest>.md`.
- Note: which tasks are Done? Which are still In Progress (why)? Which are Blocked (what's the blocker)?
- Were there tasks completed that weren't in the sprint? (scope creep or opportunistic fixes)
- What was planned vs. actual velocity? (count of tasks completed vs. planned)

### Step 2: Review project status
- Read `status/project-status.md`.
- Has any component's maturity or quality changed?
- Are there new "half-done items"?
- Are there gaps discovered during execution?

### Step 3: Review test coverage
- Read `testing/coverage.md`.
- Did coverage improve, regress, or stay flat?
- Are there uncovered areas from code written in the last sprint?

### Step 4: Check for external changes
- Ask the user: any new business requirements or stakeholder feedback?
- Any new bugs or incidents discovered?
- Changes in team capacity or priorities?
- New technical constraints or opportunities?

## Specifications
- This phase produces an assessment summary (what went well, what didn't, what's new).
- NO documents are modified in this phase — it is read-only.
- The assessment output feeds directly into Phase 2 (Refinement).

## Advice
- Don't skip this even if you think nothing changed. Reading the current state prevents planning on stale information.
- If the user says "just plan the next sprint", still do this phase quickly — it takes 5 minutes and prevents compounding errors.

## Forbidden Actions
- Do NOT modify any PPM documents during this phase.
- Do NOT make planning decisions yet.
