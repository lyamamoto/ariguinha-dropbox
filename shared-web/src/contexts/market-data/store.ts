import { create } from "zustand"
import type { Ticker } from "../../types"
import type { MarketDataState, TickerKey } from "./types"
import { createTickerKey } from "./types"

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  tickers: {},
  isConnected: false,

  setTicker: (ticker) =>
    set((state) => {
      const key = createTickerKey(ticker.assetCode, ticker.dataSourceCode)
      return {
        tickers: {
          ...state.tickers,
          [key]: ticker,
        },
      }
    }),

  setTickers: (tickers) =>
    set((state) => {
      const newTickers = { ...state.tickers }
      tickers.forEach((ticker) => {
        const key = createTickerKey(ticker.assetCode, ticker.dataSourceCode)
        newTickers[key] = ticker
      })
      return { tickers: newTickers }
    }),

  removeTicker: (assetCode, dataSourceCode) =>
    set((state) => {
      const key = createTickerKey(assetCode, dataSourceCode)
      const { [key]: _, ...rest } = state.tickers
      return { tickers: rest as Record<TickerKey, Ticker> }
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  clear: () => set({ tickers: {} }),

  getTicker: (assetCode, dataSourceCode) => {
    const key = createTickerKey(assetCode, dataSourceCode)
    return get().tickers[key]
  },

  getTickersByAsset: (assetCode) => {
    const tickers = get().tickers
    return Object.values(tickers).filter((t) => t.assetCode === assetCode)
  },

  getTickersByDataSource: (dataSourceCode) => {
    const tickers = get().tickers
    return Object.values(tickers).filter((t) => t.dataSourceCode === dataSourceCode)
  },
}))

export const useIsConnected = () => useMarketDataStore((state) => state.isConnected)

export const useTicker = (assetCode: string, dataSourceCode: string) =>
  useMarketDataStore((state) => {
    const key = createTickerKey(assetCode, dataSourceCode)
    return state.tickers[key]
  })

export const useTickersByAsset = (assetCode: string) =>
  useMarketDataStore((state) =>
    Object.values(state.tickers).filter((t) => t.assetCode === assetCode)
  )
