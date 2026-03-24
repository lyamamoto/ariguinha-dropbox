// Base shared types

export interface Asset {
  id: string
  code: string
  name: string
  assetClass: string
  assetType: string
}

export interface Ticker {
  assetCode: string
  dataSourceCode: string
  lastPrice: number
  bid?: number
  ask?: number
  priceChange: number
  priceChangePercent: number
  timestamp: Date
}

export interface WatchlistItem {
  id: string
  asset: Asset
  ticker?: Ticker
  source: string
  order: number
}

// Sales types

export interface SalesQuote {
  quoteId: string
  instrument: string
  side: "Buy" | "Sell"
  quantity: number
  price: number
  ttlMs: number
  expiresAt: string
}

export interface SalesDeal {
  dealId: string
  instrument: string
  side: "Buy" | "Sell"
  quantity: number
  price: number
  timestamp: string
  status?: string
  reason?: string
}

// Sales Monitor types (for trader-web)

export interface QuoteSnapshot {
  quoteId: string
  clientId: string
  clientCode: string
  instrumentCode: string
  side: string
  requestedQuantity: number
  enginePrice: number
  deskSpreadBps: number
  salesSpreadBps: number
  clientBidPrice: number
  clientAskPrice: number
  ttlMs: number
  expiresAt: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface DealSnapshot {
  dealId: string
  clientId: string
  clientCode: string
  quoteId: string
  instrumentCode: string
  side: string
  quantity: number
  clientPrice: number
  deskPrice: number
  notional: number
  channelType: string
  status: string
  createdAt: string
  updatedAt: string
}
