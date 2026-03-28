# K-WV2-02: React SPA for WebView2 Desktop — Extending & Conventions

**Trigger:** When adding a new domain, service, or feature to the React SPA of a WebView2 desktop application. When creating factories, hooks, or mock providers. When naming bridge messages. NOT for standalone web-only React projects.

**Pin to:** Repos containing a WinForms + WebView2 + React desktop application.

**Content:**

**Adding a new domain (e.g., `billing`) — checklist:**
1. **Contract:** create `src/api/contracts/billing.ts` with `BillingService` interface
2. **Add to AppServices:** include `billing: BillingService` in `src/api/contracts/index.ts`
3. **Factory:** create `src/api/services/billing.factory.ts` with one function per transport
4. **Bootstrap:** instantiate the service in `bootstrapWeb()`, `bootstrapDesktop()`, etc.
5. **Context hook:** add `useBillingService()` in `ServiceContext.tsx`
6. **Feature:** create `src/features/billing/` with components and hooks
7. **Mock:** add mock implementation in `mock.provider.ts`
8. **C# (if desktop):** add `BillingHandler` in the Bridge and register in the Router

**Factory pattern:** one factory per domain, one function per transport:
```
customers.factory.ts
  ├── createCustomerServiceHttp()
  ├── createCustomerServiceBridge()
  └── createCustomerServiceWs()     (if needed)
```

**Bridge message naming:** pattern `domain:action` in camelCase:
```
customers:getAll, customers:getById, customers:create
orders:exportPdf, notifications:subscribe
```

**Recommended stack:**

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ with TypeScript |
| Build | Vite |
| State/Cache | TanStack Query (React Query) |
| Routing | React Router or TanStack Router |
| Styling | Tailwind CSS + shadcn/ui |
| Testing | Vitest + Testing Library + MSW |
| Lint/Format | ESLint + Prettier |

**Testing:** Use `createMockProvider({ latency: 0 })` for unit tests. Use MSW for integration tests against real provider implementations.
