# K-WV2-04: C# WebView2 Host — Extending & Conventions

**Trigger:** When adding new handlers to the Bridge, registering services in DI, creating infrastructure implementations, or configuring the WebView2 build pipeline in the desktop host. NOT for standalone C# backends or non-desktop applications.

**Pin to:** Repos containing a WinForms + WebView2 + React desktop application.

**Content:**

**Adding a new domain handler — checklist:**
1. **Core interface:** create `IXxxRepository` or `IXxxService` in `MyApp.Core/Interfaces/`
2. **Core entities:** create entities/value objects in `MyApp.Core/Entities/`
3. **Infrastructure:** implement the interface in `MyApp.Infrastructure/` (DB, HTTP client, etc.)
4. **Bridge DTOs:** create request/response DTOs in `MyApp.Bridge/Contracts/`
5. **Bridge handler:** create `XxxHandler` in `MyApp.Bridge/Handlers/` with `Register(BridgeRouter)` method
6. **Register in DI:** add `services.AddTransient<XxxHandler>()` and infrastructure bindings in `Program.cs`
7. **Register in MainForm:** call `_xxxHandler.Register(_router)` in `InitializeAsync()`
8. **React side:** follow K-REACT-02 checklist to add the matching frontend domain

**Message naming:** `domain:action` in camelCase, mirroring React side:
```
customers:getAll, customers:getById, customers:create, customers:delete
orders:create, orders:exportPdf
```

**Bridge message format:**
```json
// Request (React → C#):
{ "type": "customers:create", "payload": { "name": "Acme", "email": "a@b.com" }, "correlationId": "uuid-123" }

// Response (C# → React):
{ "correlationId": "uuid-123", "result": { "id": "...", "name": "Acme" } }

// Push event (C# → React, unsolicited):
{ "event": "order:shipped", "data": { ... } }
```

**Error handling:**
- Handlers catch business exceptions and return structured errors.
- BridgeRouter catches unhandled exceptions and returns them as `Error`.
- React handles errors returned from bridge and displays feedback.

**Build pipeline:** React build output (`dist/`) is copied to Host's `wwwroot/` during .NET build via MSBuild target:
```xml
<Target Name="BuildReactUI" BeforeTargets="Build">
  <Exec Command="npm run build" WorkingDirectory="../myapp-ui" />
  <ItemGroup>
    <Content Include="../myapp-ui/dist/**" CopyToOutputDirectory="PreserveNewest" LinkBase="wwwroot" />
  </ItemGroup>
</Target>
```

**WebView2 setup:** Virtual host mapping (`app.local` → `wwwroot/`) for `file://`-like behavior with full web capabilities.
