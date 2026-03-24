import type { Ticker } from "../../types"

export type TickerKey = `${string}:${string}`

export interface Subscription {
  assetCode: string
  dataSourceCode: string
}

export interface MarketDataState {
  tickers: Record<TickerKey, Ticker>
  isConnected: boolean

  setTicker: (ticker: Ticker) => void
  setTickers: (tickers: Ticker[]) => void
  removeTicker: (assetCode: string, dataSourceCode: string) => void
  setConnected: (connected: boolean) => void
  clear: () => void

  getTicker: (assetCode: string, dataSourceCode: string) => Ticker | undefined
  getTickersByAsset: (assetCode: string) => Ticker[]
  getTickersByDataSource: (dataSourceCode: string) => Ticker[]
}

export interface MarketDataContextValue {
  subscribe: (assetCode: string, dataSourceCode?: string) => void
  unsubscribe: (assetCode: string, dataSourceCode?: string) => void
  subscribeMany: (subscriptions: Subscription[]) => void
  unsubscribeMany: (subscriptions: Subscription[]) => void
}

export const createTickerKey = (assetCode: string, dataSourceCode: string): TickerKey =>
  `${assetCode}:${dataSourceCode}` as TickerKey

export const parseTickerKey = (key: TickerKey): { assetCode: string; dataSourceCode: string } => {
  const [assetCode, dataSourceCode] = key.split(":")
  return { assetCode, dataSourceCode }
}
