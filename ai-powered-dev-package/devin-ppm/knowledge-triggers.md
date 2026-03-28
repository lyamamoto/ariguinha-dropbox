# Knowledge Trigger Descriptions for Devin

Copy the "When to use" text into the Devin Knowledge trigger field for each item.

---

## PPM — Project & Portfolio Management

### K-PPM-01 (Directory Structure)
**When to use:** When creating, navigating, or organizing files inside the `docs/ppm/` directory. When setting up the PPM structure for a new project.

### K-PPM-02 (Naming Conventions)
**When to use:** When creating or referencing epics (E-NNN), features (F-NNN), user stories (US-NNN.N), tasks (T-TEAM-NNN), sprints (S-NNN), NFRs (NFR-NNN), or ADRs (ADR-NNN). When assigning IDs to any PPM artifact.

### K-PPM-03 (Traceability Model)
**When to use:** When creating tasks and linking them to source requirements. When verifying that every task has a Source field, every feature belongs to an epic, and every AC maps to a test. When checking traceability integrity.

### K-PPM-04 (Task Format)
**When to use:** When creating or editing tasks in backlog files (`backlog/<team>/functional.md` or `non-functional.md`). When deriving tasks from acceptance criteria.

### K-PPM-05 (Feature Format)
**When to use:** When creating feature files, writing user stories, or defining acceptance criteria inside `requirements/functional/`.

### K-PPM-06 (Prioritization)
**When to use:** When scoring tasks with Value/Effort/Risk, calculating priority scores, updating `prioritization.md`, or deciding which tasks to schedule next.

### K-PPM-07 (Sprint Format)
**When to use:** When creating or editing sprint files in `roadmap/sprints/`. When writing sprint goals, task tables, test plans, or retrospectives.

### K-PPM-08 (NFR Format)
**When to use:** When creating or editing non-functional requirement files (sla.md, security.md, observability.md, resilience.md, ux.md, operations.md).

### K-PPM-09 (Foundations Layer)
**When to use:** When creating or editing files inside `foundations/` — tech stack, coding standards, directory structure, reuse policy, integration contracts, data governance, or ADRs.

### K-PPM-10 (Multi-Project Governance)
**When to use:** When working in a monorepo with multiple teams or projects. When handling cross-cutting features, shared code tasks tagged [shared], or consolidated prioritization across teams.

### K-PPM-11 (Project Status & Maturity)
**When to use:** When updating `status/project-status.md` or `testing/coverage.md`. When assessing component maturity (Prototype, Alpha, Beta, Production-ready) or documenting known gaps.

### K-PPM-12 (Navigation Guide)
**When to use:** When asked "what to build next", "where do I find X", or when starting any PPM-related work and needing to locate the right file.

### K-PPM-13 (Execution Discipline)
**When to use:** When implementing tasks during a sprint. When picking the next task, creating feature branches, making commits, opening PRs, updating task status, or handling discoveries mid-sprint (bugs, missing requirements, scope changes).

### K-PPM-14 (Anti-patterns)
**When to use:** When reviewing sprint processes, debugging why an iteration went badly, or when noticing behaviors like skipping assessment, expanding scope mid-sprint, or implementing without requirements.

---

## ARCH — Architecture Documentation

### K-ARCH-01 (Data Model)
**When to use:** When creating or editing `architecture.jsonld` files. When adding services, infrastructure components, data flows, or any section to the architecture documentation.

### K-ARCH-02 (Naming)
**When to use:** When creating IDs for services (arch:service/), infrastructure (arch:infra/), domains (arch:domain/), flows (arch:flow/), ADRs (arch:adr/), or external systems (arch:external/) in architecture.jsonld.

### K-ARCH-03 (Directory Structure)
**When to use:** When creating architecture documentation for a new system, adding files to the `architectures/` directory, or referencing shared files (styles.css, render.js) vs project-specific files (colors.css, index.html).

### K-ARCH-04 (Visualization Rules)
**When to use:** When customizing `index.html`, `colors.css`, or `ARCH_CONFIG` (node positions, graph connections, domain mapping, flow colors) for an architecture visualization.

---

## GIT — Git Workflow

### K-GIT-01 (Branching Model & PR Policy)
**When to use:** When creating branches (sprint/{NNN} or feature/{task-id}-{slug}), making commits with conventional format, opening pull requests, merging code, or managing branch lifecycle during a sprint.

---

## WV2 — WebView2 Desktop Stack

### K-WV2-01 (React SPA Structure)
**When to use:** When writing React code inside a WebView2 desktop application — specifically in src/api/, src/features/, or src/shared/ of the embedded SPA. NOT for standalone web-only React projects or non-desktop applications.

### K-WV2-02 (React SPA Extending)
**When to use:** When adding a new domain, service, factory, context hook, or mock provider to the React SPA of a WebView2 desktop application. When naming bridge messages (domain:action pattern). NOT for standalone web-only React projects.

### K-WV2-03 (C# Host Structure)
**When to use:** When writing C# code in the WinForms + WebView2 desktop host — specifically in Core, Infrastructure, Bridge, or Host projects. NOT for standalone C# backends, APIs, or non-desktop applications.

### K-WV2-04 (C# Host Extending)
**When to use:** When adding new handlers to the Bridge layer, registering services in DI (Program.cs), creating infrastructure implementations, or configuring the WebView2 build pipeline in the desktop host. NOT for standalone C# backends.
