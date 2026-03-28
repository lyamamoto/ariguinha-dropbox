# K-WV2-03: C# WebView2 Host — Structure & Layers

**Trigger:** When writing C# code in the WinForms + WebView2 desktop host (Core, Infrastructure, Bridge, or Host projects). NOT for standalone C# backends, APIs, or non-desktop applications.

**Pin to:** Repos containing a WinForms + WebView2 + React desktop application.

**Content:**

The C# host acts as a desktop backend: manages lifecycle, hosts WebView2, exposes native services to React via a message bridge. All external backend communication is the host's responsibility — React never talks to external services directly when embedded.

**Solution structure:**
```
MyApp/
├── src/
│   ├── MyApp.Host/                 # WinForms + WebView2 entry point (composition root)
│   ├── MyApp.Core/                 # Pure domain (entities, value objects, interfaces)
│   ├── MyApp.Infrastructure/       # Concrete implementations (DB, HTTP, WS, filesystem)
│   ├── MyApp.Bridge/               # C# ↔ React communication (Router, Handlers, DTOs)
│   └── myapp-ui/                   # React SPA (see K-REACT-01/02)
├── tests/
│   ├── MyApp.Core.Tests/
│   ├── MyApp.Infrastructure.Tests/
│   └── MyApp.Bridge.Tests/
└── MyApp.sln
```

**Separation of concerns (STRICT):**

| Layer | Knows about | Does NOT know about |
|-------|------------|-------------------|
| Core | Entities, rules, interfaces | UI, database, HTTP, WebView2 |
| Infrastructure | Core interfaces | Bridge, React, WinForms |
| Bridge | Core services, DTOs | External backends directly |
| Host | Everything (composition root) | — (assembly point) |

**Core principles:**
- Core has zero dependencies on frameworks, UI, or infrastructure.
- Infrastructure references only Core (to implement its interfaces).
- Bridge is a thin translation layer: no business logic. DTOs travel through the bridge — never Core entities.
- Host is the composition root: wires DI, initializes WebView2, registers handlers.

**Dependency direction:** Host → Bridge → Core ← Infrastructure. Infrastructure and Bridge never reference each other directly.
