# K-05: Feature File Format

**Trigger:** When creating new features, writing user stories, or defining acceptance criteria.

**Content:**

Each feature file lives at `requirements/functional/<domain>/F-NNN-<slug>.md`. One file per feature, stories embedded inside.

```markdown
# F-NNN: <Feature Title>

**Epic:** E-NNN (<Epic Name>)
**Owner:** <team>
**Status:** Complete | In Progress | Planned

## Description
<What this feature does, from the user's perspective. 2-5 sentences.>

## User Stories

### US-NNN.1: <Story Title>
**As a** <role>
**I want to** <action>
**So that** <benefit>

**Acceptance Criteria:**
- [ ] AC-1: <testable assertion>
- [ ] AC-2: <testable assertion>

**Derived Tasks:** T-ENG-042, T-ENG-043 (see backlog)

### US-NNN.2: <Next Story>
...
```

**Rules:**
- Features are unified across layers (front+back together); tasks are separated by team
- Acceptance criteria must be testable assertions (they map to test cases)
- Cross-cutting features (spanning teams) go in `requirements/functional/cross-cutting/`
- Check off ACs when verified by tests (Phase 5.2 of workflow)
