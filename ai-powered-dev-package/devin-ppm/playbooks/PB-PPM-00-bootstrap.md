# !ppm-bootstrap — Phase 0: First-Time Project Setup

**Macro:** `!ppm-bootstrap`
**When to use:** First time applying the PPM framework to a project. Execute once per project.

---

## Goal

Establish the project's foundations and initial requirements so that the iteration cycle can begin.

## Before starting: determine project type

Ask the user (or check the repo):
- **Greenfield** — no code exists yet, starting from scratch.
- **Existing project** — codebase already exists, possibly in production, needs to be documented into the framework.

The steps below branch based on this. Follow the path marked with 🟢 (greenfield) or 🔵 (existing).

## Procedure

### Step 1: Create directory structure
- Create the `docs/ppm/` tree (see Knowledge K-01 for layout).
- For multi-project: one domain directory per bounded context under `requirements/functional/`.

### Step 2: Document foundations

Fill foundations files in this order (each informs the next):

1. `foundations/tech-stack.md`
2. `foundations/directory-structure.md`
3. `foundations/coding-standards.md`
4. `foundations/reuse-policy.md`
5. `foundations/integration-contracts.md`
6. `foundations/data-governance.md`
7. `foundations/adrs/`

**🔵 Existing project:**
- Scan the codebase to auto-derive as much as possible: `*.csproj`, `package.json`, `docker-compose*.yml`, `appsettings*.json`, `.eslintrc`, `tsconfig.json`, `Dockerfile`, CI config files.
- For each foundation file, present what was found and ask the user to validate and complement.
- Extract ADRs from git history, existing docs, README, PR descriptions, and architectural comments in code. Present findings and ask: "Are there other decisions that aren't captured here?"

**🟢 Greenfield:**
- No code to scan. Ask the user directly for each file:
  - Tech stack: "What language, framework, database, and infra are you planning to use?"
  - Directory structure: "What's the planned project layout? Monorepo or multi-repo? How many services/apps?"
  - Coding standards: "Any conventions you want to enforce? Linter preferences? Patterns to require or ban?"
  - Reuse policy: "Will there be shared libraries? What's the dependency direction?"
  - Integration contracts: "Will there be multiple services communicating? What protocols?"
  - Data governance: "What database? Migration tool? Any compliance requirements (LGPD, GDPR)?"
  - ADRs: "Are there any architectural decisions already made? (e.g., 'we chose PostgreSQL over MongoDB because...')"
- It's OK for some files to be minimal at this stage. They will be refined as the project evolves.

### Step 3: Define domain model

Create `requirements/domain-model.md` with the ubiquitous language glossary.

**🔵 Existing project:**
- Scan entity classes, database models, API DTOs, and existing docs.
- Present a draft glossary: "I found these entities: Order, Product, User, Payment. Here are the relationships I inferred. Is this correct? What's missing?"
- The user corrects, adds bounded contexts, clarifies ambiguous terms.

**🟢 Greenfield:**
- Ask: "Describe what the system does. Who are the users? What are the main things they interact with?"
- From the description, extract nouns as candidate entities and verbs as candidate operations.
- Present the draft glossary for validation.

### Step 4: Write epics and features

**🔵 Existing project — reverse-engineering requirements:**

This is the most labor-intensive step. Work in passes:

**Pass 1 — Automated discovery:**
- Scan API endpoints, route files, controllers, page components.
- Group by functional area (authentication, products, orders, etc.).
- Present groupings: "I found 47 endpoints across 6 areas. Does this mapping look right?"

**Pass 2 — Epic creation:**
- For each functional group, create an epic (E-001, E-002, etc.).
- Present epics for validation.

**Pass 3 — Feature extraction (per epic, iteratively):**
- For each epic, identify distinct features from the code.
- For each feature, create the file with user stories and ACs **describing actual current behavior**.
- ACs describe what the system DOES today, not what it should do ideally.
- Mark all implemented features as `Status: Done`, all ACs as checked.
- Present each feature to the user: "F-001: Product Catalog. I documented 3 stories with these ACs based on the code. Is this accurate? Anything missing?"

**Pass 4 — Planned features:**
- Ask: "What features are planned but not yet implemented? What's the roadmap?"
- For each planned feature, create the file with `Status: Planned`, ACs unchecked.

**Important:** Don't try to cover everything in one session. Start with the 3-5 most important epics. Remaining epics can be documented in subsequent sessions using `!ppm-new-requirement`.

**🟢 Greenfield:**
- Ask: "What are the major capabilities of the system?"
- From the answer, create epics.
- For each epic, ask for features: "What specific things should users be able to do within [epic name]?"
- Write user stories with ACs. Everything starts as `Status: Planned`, ACs unchecked.

### Step 5: Define non-functional requirements

For each NFR category (SLA, security, observability, resilience, UX, operations):

**🔵 Existing project:**
- Scan for existing implementations: auth middleware, logging config, health checks, CI pipelines, test suites.
- Document current baseline: "Auth uses JWT with 1h expiration. Logging is structured JSON to stdout. No distributed tracing. CI runs on GitHub Actions with unit tests only."
- Ask: "What are your targets? What's acceptable for V1? What's the ideal state?"
- Gap between baseline and target becomes NFR tasks.

**🟢 Greenfield:**
- Ask for each category: "What are the requirements? What's the minimum for MVP?"
- Mark MVP requirements as Must Have, future goals as Should Have / Nice to Have.
- It's fine for some categories to be nearly empty at this stage (e.g., UX for a backend-only project).

### Step 6: Derive initial backlog
- Walk every unchecked AC across all requirements (functional + non-functional).
- For each: create task in appropriate team's backlog with `Source` link.
- Tag appropriately: `[shared]`, `[frontend]`, `[backend]`, `[infra]`.
- Set status to `Planned`.
- **🔵 Existing project:** also create tasks for gaps found in Step 5 (e.g., "Add distributed tracing" from observability gap).

### Step 7: Initial prioritization
- Score all `Planned` tasks using Value/Effort/Risk formula (see Knowledge K-06).
- **🔵 Existing project:** ask user for input on scoring — you can estimate effort from code analysis, but value and risk require business context.
- Produce priority queue in `backlog/prioritization.md`.

### Step 8: Define test strategy
- Document test pyramid, tooling, conventions in `testing/strategy.md`.
- **🔵 Existing project:** scan for existing test setup (test runner, existing tests, coverage reports) and document current state.
- **🟢 Greenfield:** define the strategy based on the tech stack chosen in Step 2.

### Step 9: Write initial status
- Assess each component's maturity and quality.
- Write `status/project-status.md` + `testing/coverage.md`.
- **🟢 Greenfield:** all components start at Prototype or Planned.
- **🔵 Existing project:** assess realistically. A running production service with no tests is "Production-ready" in maturity but "Poor" in quality.

### Step 10: Plan first sprint
- Execute the `!ppm-planning` playbook to create the first sprint.
- **🔵 Existing project, first sprint:** consider including documentation tasks if major areas are still undocumented. E.g., "T-PLT-001: Document remaining epics E-004 through E-006" as a task.

## Specifications
- After completion, every directory in the PPM tree should have at least one file.
- Every feature must belong to an epic.
- Every task must have a `Source` field linking to a requirement.
- `prioritization.md` must have a scored table and a priority queue.
- 🔵 Implemented features have `Status: Done` and ACs checked.
- 🟢 All features start as `Status: Planned` with ACs unchecked.

## Advice
- **Don't try to be exhaustive on the first pass.** For existing projects especially, aim to cover the top 3-5 epics well, not all 15 poorly. The framework is designed for incremental documentation — use `!ppm-new-requirement` in future iterations to fill gaps.
- **For existing projects, document what IS, not what SHOULD BE.** Write ACs that describe current behavior. If current behavior is buggy, document the bug as a gap with a backlog task to fix it — don't write the AC as the ideal behavior and leave it checked.
- **Greenfield projects will have sparse foundations.** That's fine. `integration-contracts.md` might just say "TBD — no integrations defined yet." Update it when the architecture evolves.
- **Ask the user rather than guess.** When code is ambiguous (e.g., an endpoint exists but it's unclear if it's used), ask. When there's no code (greenfield), ask for every decision. The user is the source of truth for business context.
- **For existing projects, involve the user in epic/feature validation.** Present your analysis and ask for corrections. Automated extraction will miss business nuances (e.g., a "Products" controller might actually serve two different bounded contexts).
- **This playbook may span multiple sessions for large existing projects.** That's expected. End a session after Step 4 Pass 2 if needed, and resume with Pass 3 in the next session. The directory structure and partial docs are committed to git between sessions.
