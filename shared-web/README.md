# @shared/ui

Biblioteca React compartilhada entre `trader-web`, `sales-web` e `retail-web`. Centraliza tipos, services de API, hooks, componentes UI e contextos usados por todos os frontends.

## Visao Geral

| Aspecto | Detalhe |
|---------|---------|
| Package name | `@shared/ui` |
| Localizacao | `libs/shared-web/` |
| Consumido por | `trader-web`, `sales-web`, `retail-web` |
| Consumo | Vite resolve alias + TypeScript path mappings (sem npm workspaces) |

## Para Usuarios

Este modulo nao e executado diretamente. Ele fornece a base compartilhada para os frontends.

## Para Desenvolvedores

### Estrutura de Diretorios

```
libs/shared-web/
├── src/
│   ├── index.ts                         # Re-exports publicos
│   │
│   ├── types/
│   │   └── index.ts                     # Asset, Ticker, WatchlistItem, Sales*, Monitor* types
│   │
│   ├── services/
│   │   ├── apiBase.ts                   # createApiClient, ApiResponse, ApiError
│   │   ├── securitiesApi.ts             # Securities API (assets, futures, search)
│   │   ├── salesApi.ts                  # Sales BFF API + Sales Monitor API
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useAssetSearch.ts            # Busca de ativos com debounce
│   │   └── index.ts
│   │
│   ├── contexts/
│   │   ├── market-data/
│   │   │   ├── MarketDataProvider.tsx   # WebSocket provider para precos
│   │   │   ├── store.ts                # Zustand store de tickers
│   │   │   ├── types.ts               # Ticker, PriceUpdate types
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx              # Componente Button
│   │       ├── number-input.tsx        # Input numerico com validacao
│   │       ├── parameter-section.tsx   # Secao de parametros (label + input)
│   │       ├── segmented-toggle.tsx    # Toggle segmentado (tabs)
│   │       ├── status-badge.tsx        # Badge de status com mapa de cores configuravel
│   │       ├── side-badge.tsx          # Badge Buy/Sell com variantes (text/badge)
│   │       ├── pnl-cell.tsx            # Celula de P&L colorida (+verde/-vermelho)
│   │       └── index.ts
│   │
│   └── lib/
│       ├── utils.ts                    # cn() (clsx + tailwind-merge)
│       └── format.ts                   # formatNum, formatPrice, formatQuantity, formatTime, formatPercent
│
├── package.json                        # name: "@shared/ui"
└── tsconfig.json
```

### Configuracao de Consumo

Os frontends consomem via alias (sem npm workspaces):

**vite.config.ts:**
```typescript
resolve: {
  alias: {
    "@shared/ui": path.resolve(__dirname, "../libs/shared-web/src")
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/ui/*": ["../libs/shared-web/src/*"]
    }
  }
}
```

**Uso nos frontends:**
```typescript
import { Asset, Ticker } from "@shared/ui/types"
import { securitiesApi } from "@shared/ui/services"
import { MarketDataProvider } from "@shared/ui/contexts"
import { Button, StatusBadge, SideBadge, PnLCell } from "@shared/ui/components/ui"
import { useAssetSearch } from "@shared/ui/hooks"
import { cn } from "@shared/ui/lib/utils"
import { formatPrice, formatTime, formatNum } from "@shared/ui/lib/format"
```

### O que foi Extraido do trader-web

| De (trader-web original) | Para (@shared/ui) |
|--------------------------|----------------------------|
| `src/types/index.ts` | `types/index.ts` |
| `src/services/apiBase.ts` | `services/apiBase.ts` |
| `src/services/securitiesApi.ts` | `services/securitiesApi.ts` |
| `src/contexts/market-data/*` | `contexts/market-data/*` |
| `src/hooks/useAssetSearch.ts` | `hooks/useAssetSearch.ts` |
| `src/components/ui/*` | `components/ui/*` |
| `src/lib/utils.ts` | `lib/utils.ts` |

### Adicionado para Sales Channel

| Arquivo | Descricao |
|---------|-----------|
| `services/salesApi.ts` | Cliente HTTP para Sales BFF (quotes RFQ) e Sales Monitor (quotes/deals snapshots) |
| Tipos em `types/index.ts` | SalesQuote, SalesDeal (client-facing), QuoteSnapshot, DealSnapshot (monitor) |

**Tipos simplificados (P6 — informacao minima ao cliente):**

| Tipo | Campos |
|------|--------|
| `SalesQuote` | quoteId, instrument, side, quantity, price, ttlMs, expiresAt |
| `SalesDeal` | dealId, instrument, side, quantity, price, timestamp, status?, reason? |

> **R5 (Async Accept):** `SalesDeal` agora inclui campos opcionais `status?` (e.g. "PendingLiquidityProviderAck", "Confirmed", "Failed") e `reason?` (motivo da falha) para suportar o fluxo async com estados intermediarios.

> **Nota:** `QuoteSnapshot` e `DealSnapshot` (usados pelo sales-web/monitor) permanecem com campos completos (clientCode, deskPrice, clientBidPrice, clientAskPrice, status, etc.).

### Componentes Compartilhados (Sprint 4)

Extraidos de duplicacoes cross-app (trader-web, sales-web, retail-web):

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| `StatusBadge` | `components/ui/status-badge.tsx` | Badge de status generico com mapa de cores configuravel. Default: Filled/Accepted/Complete/Confirmed = verde, Pending/PartiallyFilled/PendingLiquidityProviderAck = amarelo, New/Submitted = azul, Failed/Rejected/Cancelled/Expired = vermelho. Aceita `colorMap` custom via prop |
| `SideBadge` | `components/ui/side-badge.tsx` | Badge de lado (Buy/Sell/Long/Short). Variante `"text"` (inline, font-semibold) e `"badge"` (pill com background). Buy/Long = verde, Sell/Short = vermelho |
| `PnLCell` | `components/ui/pnl-cell.tsx` | Celula de P&L: positivo = verde com "+", negativo = vermelho, zero = dash cinza. Usa `formatNum` internamente |

### Formatting Utilities (Sprint 4)

| Funcao | Arquivo | Descricao |
|--------|---------|-----------|
| `formatNum(n, decimals?)` | `lib/format.ts` | Formata numero com separador de milhar. Default: 2 decimais |
| `formatPrice(n, decimals?)` | `lib/format.ts` | Alias para formatNum (semantica de preco). Default: 2 decimais |
| `formatQuantity(n)` | `lib/format.ts` | Formata quantidade com ate 8 decimais, remove trailing zeros |
| `formatTime(iso)` | `lib/format.ts` | Formata ISO timestamp para HH:mm:ss |
| `formatPercent(n, decimals?)` | `lib/format.ts` | Formata percentual com sufixo "%" |

### API Base Pattern

```typescript
// services/apiBase.ts
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  code?: string;
}

function createApiClient(config: ApiConfig) {
  return {
    get: <T>(path, params?, signal?) => request<T>("GET", path, { params, signal }),
    post: <T>(path, body?, signal?) => request<T>("POST", path, { body, signal }),
    put: <T>(path, body?, signal?) => request<T>("PUT", path, { body, signal }),
    delete: <T>(path, signal?) => request<T>("DELETE", path, { signal }),
  };
}
```

## Para Arquitetos

### Posicao na Arquitetura

```
┌─────────────────────────────────────────────┐
│   trader-web    sales-web    retail-web       │
│   (mesa)        (sales)     (cliente)        │
└─────────────┬──────────────┬────────────────┘
              │              │
              ▼              ▼
┌─────────────────────────────────────────────┐
│           @shared/ui              │
│                                             │
│  types/     services/    contexts/           │
│  hooks/     components/  lib/                │
└─────────────────────────────────────────────┘
```

### Decisoes de Design

1. **Vite alias em vez de npm workspaces**: Evita complexidade de workspace setup, hot reload funciona nativamente, sem overhead de publicacao

2. **Sem bundle proprio**: O pacote e consumido como source (TypeScript nao compilado), cada frontend compila junto com seu proprio build

3. **Tipos compartilhados como contratos**: Os tipos em `types/` definem os contratos entre frontend e backend — mudar aqui afeta ambos os frontends

4. **API clients compartilhados**: `securitiesApi` e `salesApi` sao usados por ambos os frontends, garantindo consistencia nas chamadas

## Para Agentes de IA

### Contexto

- **Papel**: Biblioteca compartilhada entre frontends
- **Consumidores**: trader-web, sales-web, retail-web
- **Depende de**: Nenhum modulo interno (zero dependencies)

### Quando Modificar Este Modulo

1. **Novo tipo compartilhado**: Adicionar em `types/index.ts`
2. **Novo service de API**: Criar em `services/`, exportar no barrel
3. **Novo componente UI compartilhado**: Adicionar em `components/ui/`
4. **Novo hook compartilhado**: Adicionar em `hooks/`
5. **Novo context compartilhado**: Criar em `contexts/`

### NAO Modificar Este Modulo Para

1. **Logica especifica de um frontend**: Isso pertence ao trader-web, sales-web ou retail-web
2. **Componentes de feature**: Componentes especificos de uma feature ficam no frontend

### Impacto de Mudancas

| Tipo de Mudanca | Impacto |
|-----------------|---------|
| Alterar tipo em types/ | Alto — afeta ambos os frontends |
| Adicionar novo export | Baixo — sem breaking changes |
| Alterar API client | Medio — afeta consumidores do service |
| Alterar componente UI | Medio — afeta ambos os frontends |

### Arquivos Principais

| Arquivo | Proposito |
|---------|-----------|
| `types/index.ts` | Contratos de tipos compartilhados (Asset, Ticker, Sales*, Monitor*) |
| `services/apiBase.ts` | Factory de API clients |
| `services/securitiesApi.ts` | Securities API (assets, futures, search) |
| `services/salesApi.ts` | Sales BFF API + Sales Monitor API |
| `contexts/market-data/` | WebSocket provider + Zustand store de precos |
| `hooks/useAssetSearch.ts` | Hook de busca de ativos com debounce |
| `components/ui/` | Componentes visuais base (Button, NumberInput, StatusBadge, SideBadge, PnLCell) |
| `lib/utils.ts` | cn() utility |
| `lib/format.ts` | Formatting utilities (formatNum, formatPrice, formatQuantity, formatTime, formatPercent) |
