# K-19: Git Branching Model & PR Policy

**Trigger:** When creating branches, making commits, opening pull requests, or merging code during a sprint.

**Content:**

## Branch structure

```
main (or develop)
  └── sprint/{NNN}                              # Created at sprint start
        ├── feature/{task-id}-{slug}            # One per task
        ├── feature/{task-id}-{slug}
        └── feature/{task-id}-{slug}
```

**Branch naming:**
- Sprint branch: `sprint/{NNN}` — e.g., `sprint/007`. Created from the main branch at planning time.
- Feature branch: `feature/{task-id}-{slug}` — e.g., `feature/T-ENG-051-ws-reconnection`. Created from the sprint branch when starting a task.
- The task ID in the branch name is mandatory — it enables traceability from git history back to the PPM backlog.

## Commit conventions

Use conventional commits with the task ID as scope:

```
feat(T-ENG-051): implement WebSocket reconnection logic
test(T-ENG-051): add reconnection timeout and retry tests
fix(T-ENG-051): handle edge case when server closes mid-handshake
docs(T-ENG-051): update integration-contracts.md with WS retry spec
refactor(T-ENG-051): extract reconnection strategy to shared module
```

Prefixes: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`. The task ID scope is mandatory for all commits within a feature branch.

## Pull request flow

**Feature → Sprint PR (per task):**
- Opened when a task is complete: tests passing, status updated in backlog + sprint file, ACs verified.
- PR title: `T-ENG-051: WebSocket reconnection`
- PR description must include:
  - **Task:** T-ENG-051 (link to backlog)
  - **Source:** F-NNN / US-NNN.N (link to requirement)
  - **ACs verified:** list of acceptance criteria covered
  - **Tests added:** list of tests written with pass status
  - **Notes:** anything the reviewer should know
- Target: `sprint/{NNN}`
- Reviewer: the pilot (human)
- After approval: merge (squash or regular, per team convention), delete feature branch.

**Sprint → Main PR (per sprint):**
- Opened during `!ppm-close` after all feature PRs are merged.
- PR title: `Sprint {NNN}: {Sprint Goal}`
- PR description must include:
  - **Sprint goal:** the theme sentence
  - **Tasks completed:** list with task IDs and titles
  - **Tasks deferred/carried over:** list with reasons
  - **Coverage changes:** before → after
  - **Status changes:** component maturity changes
  - **Architecture changes:** yes/no, summary if yes
  - **Retrospective summary:** key takeaways
- Target: main branch (or develop, whatever the sprint branched from)
- Reviewer: the pilot (human)
- After approval: merge, delete sprint branch.

## Branch lifecycle rules

- Feature branches that are **Blocked or Deferred** do NOT get PRs. The branch stays (for carry-over) or is deleted (for deferred tasks).
- Carried-over feature branches stay on the sprint branch. At next sprint planning, they are rebased onto the new `sprint/{NNN+1}` branch.
- Never commit directly to `sprint/{NNN}` — all work goes through feature branches and PRs.
- Never commit directly to `main` — all work goes through sprint branches and PRs.
