import { createApiClient } from "./apiBase"

const SECURITIES_API_URL =
  import.meta.env.VITE_SECURITIES_API_URL || "http://localhost:5157"

const client = createApiClient({ baseUrl: SECURITIES_API_URL })

export interface AssetDto {
  id: string
  internalSymbol: string
  name: string
  assetClassCode: string
  assetTypeCode: string
  isActive: boolean
}

export interface FutureAssetDto {
  id: string
  code: string
  name: string
  assetClass: string
  assetType: string
  maturity: string
  underlying: string
}

export interface AssetSearchDto {
  id: string
  internalSymbol: string
  name: string
  assetClassCode: string
  assetTypeCode: string
  isActive: boolean
}

async function getAssets(): Promise<AssetDto[]> {
  const response = await client.get<AssetDto[]>("/api/assets")
  return response.data ?? []
}

async function getAssetByTicker(ticker: string): Promise<AssetDto | null> {
  const response = await client.get<AssetDto>(`/api/assets/by-ticker/${ticker}`)
  return response.data
}

async function getFuturesByUnderlying(
  underlyingTicker: string
): Promise<FutureAssetDto[]> {
  const response = await client.get<FutureAssetDto[]>(
    `/api/assets/futures/${underlyingTicker}`
  )
  return response.data ?? []
}

async function searchAssets(
  query: string,
  limit = 10,
  signal?: AbortSignal
): Promise<AssetSearchDto[]> {
  const response = await client.get<AssetSearchDto[]>(
    "/api/assets/search",
    { q: query, limit },
    signal
  )
  return response.data ?? []
}

async function seedCryptoFutures(): Promise<{
  message: string
  createdAssets: string[]
}> {
  const response = await client.post<{
    message: string
    createdAssets: string[]
  }>("/api/seed/crypto-futures")
  return response.data ?? { message: "Failed", createdAssets: [] }
}

export const securitiesApi = {
  getAssets,
  getAssetByTicker,
  getFuturesByUnderlying,
  searchAssets,
  seedCryptoFutures,
}
