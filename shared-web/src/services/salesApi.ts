import { createApiClient } from "./apiBase"
import type { SalesQuote, SalesDeal, QuoteSnapshot, DealSnapshot } from "../types"

const SALES_BFF_URL =
  import.meta.env.VITE_SALES_BFF_URL || "http://localhost:5210"

const SALES_MONITOR_URL =
  import.meta.env.VITE_SALES_MONITOR_URL || "http://localhost:5220"

const bffClient = createApiClient({ baseUrl: SALES_BFF_URL })
const monitorClient = createApiClient({ baseUrl: SALES_MONITOR_URL })

// -- Client-facing API (via BFF HTTP fallback) --

async function requestQuote(params: {
  clientId: string
  baseAssetTicker?: string
  quoteAssetTicker?: string
  instrumentCode?: string
  side: string
  quantity: number
}): Promise<SalesQuote | null> {
  const response = await bffClient.post<SalesQuote>("/api/sales/quotes/request", params)
  return response.data
}

async function acceptQuote(quoteId: string): Promise<SalesDeal | null> {
  const response = await bffClient.post<SalesDeal>(`/api/sales/quotes/${quoteId}/accept`)
  return response.data
}

async function rejectQuote(quoteId: string): Promise<boolean> {
  const response = await bffClient.post<void>(`/api/sales/quotes/${quoteId}/reject`)
  return response.success
}

// -- Monitor API (for trader-web) --

async function getMonitorQuotes(params?: {
  date?: string
  clientCode?: string
  status?: string
}): Promise<QuoteSnapshot[]> {
  const response = await monitorClient.get<QuoteSnapshot[]>("/api/sales-monitor/quotes", params)
  return response.data ?? []
}

async function getMonitorDeals(params?: {
  date?: string
  clientCode?: string
  status?: string
}): Promise<DealSnapshot[]> {
  const response = await monitorClient.get<DealSnapshot[]>("/api/sales-monitor/deals", params)
  return response.data ?? []
}

export const salesApi = {
  requestQuote,
  acceptQuote,
  rejectQuote,
  getMonitorQuotes,
  getMonitorDeals,
}
