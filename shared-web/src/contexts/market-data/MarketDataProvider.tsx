import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import type { Ticker } from "../../types"
import { useMarketDataStore } from "./store"
import { type MarketDataContextValue, type Subscription } from "./types"

interface PriceUpdate {
  assetCode: string
  dataSourceCode: string
  lastPrice: number
  bid?: number
  ask?: number
  priceChange: number
  priceChangePercent: number
  timestamp: string
}

interface WebSocketAvailableAssetsMessage {
  type: "availableAssets"
  data: string[]
}

interface WebSocketPriceMessage {
  type: "snapshot" | "priceUpdate"
  data: PriceUpdate[]
}

type WebSocketMessage = WebSocketAvailableAssetsMessage | WebSocketPriceMessage

const WS_URL = "ws://localhost:5185/ws/prices"
const RECONNECT_DELAY = 3000

const MarketDataContext = createContext<MarketDataContextValue | null>(null)

interface MarketDataProviderProps {
  wsUrl?: string
  children: ReactNode
}

export function MarketDataProvider({ wsUrl, children }: MarketDataProviderProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subscribedRef = useRef<Set<string>>(new Set())
  const url = wsUrl ?? WS_URL

  const { setTicker, setConnected } = useMarketDataStore()

  const getSubscriptionKey = (assetCode: string, dataSourceCode?: string) =>
    dataSourceCode ? `${assetCode}:${dataSourceCode}` : assetCode

  const sendSubscription = useCallback(
    (action: "subscribe" | "unsubscribe", assetCode: string, dataSourceCode?: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const message = dataSourceCode
          ? { action, assetCode, dataSourceCode }
          : { action, assetCode }
        wsRef.current.send(JSON.stringify(message))
      }
    },
    []
  )

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[MarketData] WebSocket connected")
      setConnected(true)

      subscribedRef.current.forEach((key) => {
        const [assetCode, dataSourceCode] = key.split(":")
        sendSubscription("subscribe", assetCode, dataSourceCode)
      })
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)

        if (message.type === "snapshot" || message.type === "priceUpdate") {
          message.data?.forEach((price) => {
            const ticker: Ticker = {
              assetCode: price.assetCode,
              dataSourceCode: price.dataSourceCode,
              lastPrice: price.lastPrice,
              bid: price.bid,
              ask: price.ask,
              priceChange: price.priceChange,
              priceChangePercent: price.priceChangePercent,
              timestamp: new Date(price.timestamp),
            }
            setTicker(ticker)
          })
        }
      } catch (error) {
        console.error("[MarketData] Error parsing WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      console.log("[MarketData] WebSocket disconnected, reconnecting...")
      setConnected(false)
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.onerror = (error) => {
      console.error("[MarketData] WebSocket error:", error)
    }
  }, [url, setTicker, setConnected, sendSubscription])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  const subscribe = useCallback(
    (assetCode: string, dataSourceCode?: string) => {
      const key = getSubscriptionKey(assetCode, dataSourceCode)
      if (!subscribedRef.current.has(key)) {
        subscribedRef.current.add(key)
        sendSubscription("subscribe", assetCode, dataSourceCode)
      }
    },
    [sendSubscription]
  )

  const unsubscribe = useCallback(
    (assetCode: string, dataSourceCode?: string) => {
      const key = getSubscriptionKey(assetCode, dataSourceCode)
      if (subscribedRef.current.has(key)) {
        subscribedRef.current.delete(key)
        sendSubscription("unsubscribe", assetCode, dataSourceCode)
      }
    },
    [sendSubscription]
  )

  const subscribeMany = useCallback(
    (subscriptions: Subscription[]) => {
      subscriptions.forEach(({ assetCode, dataSourceCode }) => {
        subscribe(assetCode, dataSourceCode)
      })
    },
    [subscribe]
  )

  const unsubscribeMany = useCallback(
    (subscriptions: Subscription[]) => {
      subscriptions.forEach(({ assetCode, dataSourceCode }) => {
        unsubscribe(assetCode, dataSourceCode)
      })
    },
    [unsubscribe]
  )

  const contextValue: MarketDataContextValue = {
    subscribe,
    unsubscribe,
    subscribeMany,
    unsubscribeMany,
  }

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarketData(): MarketDataContextValue {
  const context = useContext(MarketDataContext)
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider")
  }
  return context
}
