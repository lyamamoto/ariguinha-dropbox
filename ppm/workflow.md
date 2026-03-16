# PPM Framework — Iteration Workflow

**Purpose:** Step-by-step operational guide for using the PPM Framework in each iteration cycle. Covers both the initial bootstrap and the recurring iteration loop.

---

## Table of Contents

1. [Workflow Overview](#1-workflow-overview)
2. [Phase 0 — Bootstrap (first-time only)](#2-phase-0--bootstrap)
3. [Phase 1 — Assessment (Day 0)](#3-phase-1--assessment)
4. [Phase 2 — Refinement (Day 0-1)](#4-phase-2--refinement)
5. [Phase 3 — Sprint Planning (Day 1)](#5-phase-3--sprint-planning)
6. [Phase 4 — Execution (Sprint Duration)](#6-phase-4--execution)
7. [Phase 5 — Sprint Close (Last Day)](#7-phase-5--sprint-close)
8. [Workflow Cheat Sheet](#8-workflow-cheat-sheet)
9. [Anti-patterns](#9-anti-patterns)

---

## 1. Workflow Overview

Each iteration follows a 5-phase cycle. Phases 1-5 repeat every sprint.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ITERATION CYCLE                                 │
│                                                                     │
│   ┌──────────┐   ┌────────────┐   ┌──────────┐                     │
│   │ Phase 1  │──→│  Phase 2   │──→│ Phase 3  │                     │
│   │Assessment│   │ Refinement │   │ Planning │                     │
│   └──────────┘   └────────────┘   └──────────┘                     │
│        ▲                                │                           │
│        │                                ▼                           │
│   ┌──────────┐                   ┌──────────┐                      │
│   │ Phase 5  │◀──────────────────│ Phase 4  │                      │
│   │  Close   │                   │Execution │                      │
│   └──────────┘                   └──────────┘                      │
│        │                                                            │
│        └──────────────── next iteration ───────────────→ Phase 1    │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principle:** each phase produces outputs that are inputs to the next. Skipping a phase creates information gaps that compound over iterations.

---

## 2. Phase 0 — Bootstrap

**When:** First time applying the framework to a project. Executed once.

**Goal:** Establish the project's foundations and initial requirements so that the iteration cycle can begin.

### Steps

#### 0.1 — Create Directory Structure

Create the `docs/ppm/` tree as defined in `framework.md` Section 2. For a multi-project, create one domain directory per bounded context under `requirements/functional/`.

**Output:** empty directory tree ready to be populated.

#### 0.2 — Document Foundations

Fill the foundations layer in this order (each informs the next):

| Step | File | Input Source |
|------|------|-------------|
| 0.2.1 | `foundations/tech-stack.md` | Team knowledge, existing code |
| 0.2.2 | `foundations/directory-structure.md` | Existing repo layout |
| 0.2.3 | `foundations/coding-standards.md` | Existing conventions, linters |
| 0.2.4 | `foundations/reuse-policy.md` | Shared lib analysis |
| 0.2.5 | `foundations/integration-contracts.md` | API specs, message schemas |
| 0.2.6 | `foundations/data-governance.md` | DB schemas, migration history |
| 0.2.7 | `foundations/adrs/` | Existing decisions (extract from code, docs, memory) |

**Tip for AI agent:** scan the codebase (`*.csproj`, `package.json`, `docker-compose*.yml`, `appsettings*.json`) to auto-derive tech stack and integration contracts. Use git history and existing docs to extract ADRs.

**Output:** populated `foundations/` directory.

#### 0.3 — Define Domain Model

Create `requirements/domain-model.md` with the ubiquitous language glossary. Sources:
- Entity classes in the codebase
- Existing documentation
- Team knowledge / MEMORY.md

**Output:** glossary + entity relationships.

#### 0.4 — Write Epics and Features from Existing State

For an existing project, work backwards from what's already built:

1. Identify major system capabilities → create epics (E-NNN)
2. For each epic, identify features that exist or are planned → create feature files (F-NNN)
3. For each feature, write user stories with acceptance criteria
4. Mark implemented features/stories as `Status: Done` with ACs checked

**For a greenfield project:** write epics and features from the product vision forward.

**Output:** populated `requirements/functional/` with epics and feature files.

#### 0.5 — Define Non-Functional Requirements

For each NFR category, assess current state and define targets:

1. What exists today? (current baseline)
2. What is the minimum viable target? (V1)
3. What is the ideal target? (future)

Mark NFRs with appropriate priority (Must Have / Should Have / Nice to Have).

**Output:** populated `requirements/non-functional/` files.

#### 0.6 — Derive Initial Backlog

Walk through every unchecked acceptance criterion across all requirements:

1. For each unchecked AC, create a task in the appropriate team's backlog
2. Set `Source` to the requirement/AC that originated it
3. Tag with `[shared]`, `[frontend]`, `[backend]`, `[infra]` as appropriate
4. Set status to `Planned`

**Output:** populated `backlog/<team>/` files.

#### 0.7 — Initial Prioritization

Score all `Planned` tasks using the Value/Effort/Risk matrix and produce the priority queue.

**Output:** `backlog/prioritization.md` with scored tasks and dependency graph.

#### 0.8 — Define Test Strategy

Document the test pyramid, tooling, and conventions.

**Output:** `testing/strategy.md`.

#### 0.9 — Write Initial Status

Assess each component's current maturity and quality.

**Output:** `status/project-status.md` + `testing/coverage.md`.

#### 0.10 — Plan First Sprint

With all the above in place, execute Phase 3 (Sprint Planning) to create the first sprint.

---

## 3. Phase 1 — Assessment

**When:** Start of each iteration (before any planning).

**Goal:** Understand where the project stands RIGHT NOW. This phase is read-only — no decisions yet.

**Duration:** ~30 min (human) or ~5 min (AI agent).

### Steps

#### 1.1 — Review Previous Sprint

Read the previous sprint file (`roadmap/sprints/sprint-NNN.md`):

- [ ] Which tasks are Done?
- [ ] Which tasks are still In Progress? Why?
- [ ] Which tasks are Blocked? What's the blocker?
- [ ] Were there tasks completed that weren't in the sprint? (scope creep or opportunistic fixes)
- [ ] What was the planned vs. actual velocity? (count of tasks completed)

**Output:** mental model (or written notes) of sprint outcome.

#### 1.2 — Review Project Status

Read `status/project-status.md`:

- [ ] Has any component's maturity or quality changed?
- [ ] Are there new "half-done items" that appeared?
- [ ] Are there gaps that were discovered during execution?

#### 1.3 — Review Test Coverage

Read `testing/coverage.md`:

- [ ] Did coverage improve, regress, or stay flat?
- [ ] Are there new uncovered areas from code written in the last sprint?

#### 1.4 — Check for External Changes

Sources outside the framework that may affect planning:

- [ ] New business requirements or stakeholder feedback?
- [ ] New bugs or incidents discovered?
- [ ] Changes in team capacity or priorities?
- [ ] New technical constraints or opportunities?

**Output of Phase 1:** An assessment summary — what went well, what didn't, what's new. This feeds into Phase 2.

---

## 4. Phase 2 — Refinement

**When:** After Assessment, before Sprint Planning.

**Goal:** Update ALL framework artifacts to reflect current reality. After this phase, every document is accurate and up-to-date.

**Duration:** ~1-2 hours (human) or ~15-30 min (AI agent).

### Steps

#### 2.1 — Update Status Documents

Based on Phase 1 findings:

- [ ] Update `status/project-status.md` — component health, gaps, half-done items
- [ ] Update `testing/coverage.md` — new test counts, new gaps

#### 2.2 — Close Previous Sprint

In the previous sprint file:

- [ ] Set final status for all tasks (Done / Deferred / Carried over)
- [ ] Write sprint retrospective (what went well, what to improve, action items)
- [ ] Update `roadmap/roadmap.md` sprint status to Done

#### 2.3 — Process New Requirements

For any new business requirements, bugs, or discoveries from Phase 1.4:

- [ ] Create or update epic if it's a new capability
- [ ] Create feature file with stories and acceptance criteria
- [ ] Derive tasks into team backlogs with `Source` links
- [ ] For bugs: create task directly in backlog with `Source: BUG-NNN` and add bug to a bugs section in status

#### 2.4 — Update Existing Requirements

For features that evolved during implementation:

- [ ] Update acceptance criteria to reflect actual behavior (if intentionally changed)
- [ ] Check off completed ACs
- [ ] Update feature status (Planned → In Progress → Done)

#### 2.5 — Groom Backlog

Review all `Planned` and `Deferred` tasks:

- [ ] Remove tasks that are no longer relevant (delete, don't defer)
- [ ] Split tasks that turned out to be too large
- [ ] Merge tasks that turned out to be trivially related
- [ ] Update descriptions for tasks whose understanding has improved
- [ ] Carry over incomplete tasks from previous sprint (update status, add notes)

#### 2.6 — Re-prioritize

Update `backlog/prioritization.md`:

- [ ] Score any new tasks (Value / Effort / Risk)
- [ ] Re-score tasks whose context changed (e.g., effort became clearer, risk increased)
- [ ] Update dependency graph if new dependencies emerged
- [ ] Regenerate priority queue (ordered list)

**Output of Phase 2:** All documents reflect current truth. Backlog is groomed and prioritized. Ready for sprint planning.

---

## 5. Phase 3 — Sprint Planning

**When:** After Refinement. This is the commitment point.

**Goal:** Select tasks for the next sprint, define the sprint goal, and create the test plan.

**Duration:** ~30 min.

### Steps

#### 3.1 — Determine Sprint Capacity

Estimate how many tasks can fit in the sprint based on:

- Historical velocity (tasks completed in previous sprints)
- Team availability (vacations, other commitments)
- Carry-over load (incomplete tasks from last sprint)

**Rule of thumb:** plan at 70-80% of historical velocity to leave room for unknowns.

#### 3.2 — Select Tasks from Priority Queue

Walk the priority queue top-down:

1. Take the highest-priority task
2. Check: are its dependencies Done or scheduled in this sprint?
   - Yes → include it
   - No → skip it (or include the dependency first)
3. Check: does the team have capacity?
   - Yes → include it
   - No → stop for that team
4. Repeat until sprint is full

**Balance rules:**
- Every sprint SHOULD have at least one task that delivers **visible user value** (not just infra/refactoring)
- If a `P1` task is blocked by dependencies, pull the blocking tasks into this sprint even if they're lower priority
- `[shared]` tasks count toward the consuming team's capacity, not a separate "shared" budget

#### 3.3 — Define Sprint Goal

Write 1-2 sentences describing the sprint's theme and primary outcome. The goal is NOT a list of tasks — it's the *why* behind the selection.

Good: "Enable real-time risk monitoring so traders can operate within limits."
Bad: "Do T-ENG-051, T-ENG-052, T-RET-012."

#### 3.4 — Create Test Plan

For each task in the sprint, extract the acceptance criteria from the source requirement and compile the test plan:

| Test | Type | Source AC | Status |
|------|------|----------|--------|
| ... | Unit/Integration/E2E | F-NNN/US-NNN.N/AC-N | Pending |

**Rules:**
- Every AC of every selected task MUST have at least one test in the plan
- Identify test type: unit, integration, E2E, manual
- If a test requires infrastructure not yet available, note it as a blocker

#### 3.5 — Write Sprint File

Create `roadmap/sprints/sprint-NNN.md` with all the above:
- Goal, duration, status
- Task table with assignments
- Test plan
- Empty retrospective section

#### 3.6 — Update Roadmap

Update `roadmap/roadmap.md` with the new sprint row.

**Output of Phase 3:** Committed sprint plan with tasks, test plan, and clear goal.

---

## 6. Phase 4 — Execution

**When:** Sprint duration (the bulk of the iteration).

**Goal:** Implement the planned tasks, run tests, and track progress.

### Steps

#### 4.1 — Pick a Task

Select the next task to work on. Consider:

1. Dependencies: work on unblocked tasks first
2. Priority: within unblocked tasks, prefer higher priority
3. Context: if already working in a module, do related tasks together to minimize context-switching

#### 4.2 — Implement

Write code. Follow the foundations (coding standards, patterns, directory structure).

**During implementation, maintain awareness of:**
- Does the implementation match the acceptance criteria exactly?
- Are there edge cases the AC didn't cover? → note them for refinement
- Is the task bigger than expected? → flag it, consider splitting

#### 4.3 — Test

After implementing, verify against the sprint's test plan:

1. Write/run the tests listed for this task's ACs
2. Mark test status in sprint file (Pending → Pass/Fail)
3. If a test fails, fix the implementation (not the test, unless the AC was wrong)

#### 4.4 — Update Task Status

In the team's backlog file:
- Set task status to `Done`
- Check off the Definition of Done items

In the sprint file:
- Update task status to `Done`

#### 4.5 — Handle Discoveries

During execution, you will discover things. Handle them correctly:

| Discovery | Action |
|-----------|--------|
| **Bug in existing code** | Create task in backlog with `Source: BUG`, add to sprint if critical, else backlog |
| **Missing requirement** | Note it. Do NOT implement it now. Add to backlog in Phase 2 next iteration |
| **Task is bigger than estimated** | Split: complete what's feasible, create new task for remainder |
| **Task is trivially easy** | Complete it, pick next task. Do NOT expand scope |
| **New idea / improvement** | Add to backlog as `Planned`. Do NOT implement unless it's the current task |
| **Blocker from another team** | Mark task as `Blocked`, document blocker, pick another task |

**Critical rule:** do NOT add unplanned work to the sprint mid-execution unless it is a P1 blocker to a sprint task. Everything else goes to the backlog for next iteration.

#### 4.6 — Mid-Sprint Check (optional, for longer sprints)

At the sprint's midpoint:
- Are we on track to complete the sprint goal?
- Any tasks at risk? Adjust by descoping lowest-priority tasks if needed.

**Output of Phase 4:** Implemented tasks with passing tests, updated statuses.

---

## 7. Phase 5 — Sprint Close

**When:** Last day of the sprint (or when all tasks are done).

**Goal:** Wrap up the sprint, update all tracking documents, prepare for next iteration.

### Steps

#### 5.1 — Final Task Review

Go through every task in the sprint:

- [ ] All `Done` tasks have passing tests
- [ ] All `Done` tasks have their Definition of Done items checked
- [ ] Incomplete tasks are marked as `In Progress` (carrying over) or `Deferred` (with reason)

#### 5.2 — Update Acceptance Criteria in Requirements

For each completed task:

- [ ] Go to the source feature file (F-NNN)
- [ ] Check off the acceptance criteria that are now verified by tests
- [ ] If all ACs of a user story are checked, mark the story as Done
- [ ] If all stories of a feature are Done, mark the feature as Done

This is the **traceability close-the-loop** step. It ensures requirements reflect reality.

#### 5.3 — Update Test Coverage

Update `testing/coverage.md`:

- [ ] New test counts per module
- [ ] New coverage gaps discovered during sprint (link to backlog tasks)

#### 5.4 — Update Project Status

Update `status/project-status.md`:

- [ ] Component maturity changes (e.g., Alpha → Beta if feature-complete)
- [ ] New capabilities added
- [ ] Gaps resolved or discovered

#### 5.5 — Sprint Retrospective

Fill the retrospective section in the sprint file:

- **What went well:** practices to continue
- **What to improve:** pain points, inefficiencies
- **Action items:** concrete changes for next iteration (these become inputs to Phase 2 next time)

**Retrospective prompts:**
- Did the sprint goal get achieved?
- Was the scope realistic? Over/under-committed?
- Did discoveries cause significant unplanned work?
- Are there recurring blockers that need systemic fixes?
- Did the test plan catch real issues?

#### 5.6 — Archive & Prepare

- [ ] Mark sprint status as `Done` in `roadmap/roadmap.md`
- [ ] Ensure all documents are saved and committed to git

**Output of Phase 5:** Closed sprint with retrospective, all documents up-to-date. Ready for Phase 1 of next iteration.

---

## 8. Workflow Cheat Sheet

Quick reference for each phase:

```
PHASE 1 — ASSESSMENT (read-only)
  □ Read previous sprint results
  □ Read project status
  □ Read test coverage
  □ Check for external changes
  Output: assessment summary

PHASE 2 — REFINEMENT (update docs)
  □ Update status + coverage docs
  □ Close previous sprint (retro)
  □ Process new requirements → features → tasks
  □ Update existing requirements (check ACs)
  □ Groom backlog (split, merge, remove)
  □ Re-prioritize (score, dependencies, queue)
  Output: all docs reflect current truth

PHASE 3 — SPRINT PLANNING (commit)
  □ Determine capacity
  □ Select tasks from priority queue
  □ Define sprint goal
  □ Create test plan from ACs
  □ Write sprint file
  □ Update roadmap
  Output: committed sprint plan

PHASE 4 — EXECUTION (build)
  □ Pick task → implement → test → mark done
  □ Handle discoveries (backlog, don't expand scope)
  □ Mid-sprint check if needed
  Output: working code + passing tests

PHASE 5 — SPRINT CLOSE (wrap up)
  □ Final task review
  □ Check off ACs in requirement files
  □ Update coverage + status docs
  □ Write retrospective
  □ Mark sprint done in roadmap
  Output: closed sprint, docs current
```

---

## 9. Anti-patterns

Behaviors that degrade the framework's value over time:

| Anti-pattern | Why It's Bad | Correct Approach |
|-------------|-------------|-----------------|
| **Skipping Assessment** | You plan based on stale information | Always read status before planning |
| **Planning without grooming** | Sprint includes irrelevant or oversized tasks | Always refine backlog before selecting tasks |
| **Expanding scope mid-sprint** | Sprint never finishes, velocity is unmeasurable | Add discoveries to backlog, not to current sprint |
| **Implementing without a requirement** | No traceability, no test criteria, no definition of done | Create the requirement first, even if minimal |
| **Skipping test plan** | You don't know what "done" means | Every task needs testable ACs before starting |
| **Not closing ACs in requirement files** | Requirements show everything as incomplete despite progress | Phase 5.2 is mandatory |
| **Deferring without reason** | Backlog becomes a graveyard | Either delete or defer with a specific revisit date |
| **Gold-plating during execution** | Doing more than the AC specifies wastes capacity | Implement exactly the AC, no more |
| **Skipping retrospective** | Same mistakes repeat every sprint | Even 3 bullet points is valuable |
| **Updating docs only at sprint close** | Mid-sprint status is opaque | Update task status as you complete each task (Phase 4.4) |

---

## Appendix — AI Agent Iteration Protocol

When an AI agent runs the iteration cycle, it should follow this protocol:

### Starting a New Iteration

```
1. Read: roadmap/sprints/sprint-<latest>.md         → Phase 1.1
2. Read: status/project-status.md                   → Phase 1.2
3. Read: testing/coverage.md                        → Phase 1.3
4. Ask user: any external changes?                  → Phase 1.4
5. Update: status + coverage docs                   → Phase 2.1
6. Update: previous sprint (close, retro)           → Phase 2.2
7. Ask user: new requirements or discoveries?       → Phase 2.3
8. Process: new reqs → features → tasks             → Phase 2.3
9. Update: requirement files (check ACs)            → Phase 2.4
10. Groom: review backlog, split/merge/remove       → Phase 2.5
11. Re-score: prioritization.md                     → Phase 2.6
12. Plan: select tasks, write sprint file           → Phase 3
13. Present sprint plan to user for approval
```

### During Execution

```
For each task:
  1. Read the source requirement (F-NNN or NFR-NNN)
  2. Read the acceptance criteria
  3. Implement
  4. Write tests matching ACs
  5. Update task status in backlog + sprint file
  6. If discovery → add to backlog, inform user, do NOT implement
```

### Closing a Sprint

```
1. Walk all tasks in sprint file → verify Done/Deferred
2. Walk source requirements → check off verified ACs
3. Update testing/coverage.md
4. Update status/project-status.md
5. Write retrospective in sprint file
6. Mark sprint Done in roadmap.md
7. Commit all doc changes
```
