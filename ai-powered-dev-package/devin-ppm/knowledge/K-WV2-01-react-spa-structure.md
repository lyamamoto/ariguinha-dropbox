# K-WV2-01: React SPA for WebView2 Desktop — Structure & Layers

**Trigger:** When writing React code inside a WebView2 desktop application project (the embedded SPA). When creating files in `src/api/`, `src/features/`, or `src/shared/` of the desktop app's UI project. NOT for standalone web-only React projects.

**Pin to:** Repos containing a WinForms + WebView2 + React desktop application.

**Content:**

The React SPA has zero coupling to its runtime environment (WebView2 desktop or standalone browser). The environment is decided at bootstrap via Provider Pattern with service composition.

**Directory structure:**
```
src/
├── api/                          # Service abstraction layer
│   ├── contracts/                # WHAT each service does (pure TS interfaces)
│   ├── transports/               # HOW it communicates (http, ws, webview-bridge)
│   ├── services/                 # Glues contract + transport (factories)
│   ├── bootstrap.ts              # Composition per environment
│   ├── ServiceContext.tsx         # React Context + hooks
│   └── index.ts                  # Public re-exports
├── features/                     # Functionality by domain (components + hooks + types)
│   ├── {domain}/
│   │   ├── {Component}.tsx
│   │   ├── use{Domain}.ts
│   │   └── {domain}.types.ts
├── shared/                       # Cross-cutting (generic UI, hooks, utils)
└── main.tsx                      # Entry point and bootstrap
```

**Dependency rules (STRICT):**

| Layer | Can import from | Cannot import from |
|-------|----------------|-------------------|
| contracts/ | (nothing — pure types) | Everything |
| transports/ | (nothing — pure primitives) | contracts, services, features |
| services/ | contracts, transports | features, shared, React |
| bootstrap.ts | contracts, transports, services | features, shared |
| ServiceContext | contracts, React | transports, services |
| features/ | contracts (via Context hooks), shared | transports, services, api/* |
| shared/ | (nothing or other shared) | features, api/* |

**Core principle:** Components and hooks depend only on interfaces (Contracts). Features NEVER import transports directly.
