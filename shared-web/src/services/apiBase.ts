export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: string
  code?: string
}

export interface ApiConfig {
  baseUrl: string
  defaultHeaders?: Record<string, string>
}

export class ApiError extends Error {
  statusCode?: number
  code?: string

  constructor(message: string, statusCode?: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
  }
}

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        const text = await response.text()
        throw new ApiError(
          text || response.statusText,
          response.status,
          "NonJsonError"
        )
      }
      return { success: true, data: null }
    }

    const json = (await response.json()) as ApiResponse<T>

    if (!response.ok && !json.success) {
      throw new ApiError(
        json.error || response.statusText,
        response.status,
        json.code
      )
    }

    return json
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw error
    }

    console.error("API Error:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "NetworkError",
    }
  }
}

export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, baseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

export function createApiClient(config: ApiConfig) {
  const { baseUrl, defaultHeaders = {} } = config

  async function request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined>
      signal?: AbortSignal
    }
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(baseUrl, path, options?.params)

    return fetchApi<T>(url, {
      method,
      headers: defaultHeaders,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    })
  }

  return {
    get: <T>(
      path: string,
      params?: Record<string, string | number | boolean | undefined>,
      signal?: AbortSignal
    ) => request<T>("GET", path, { params, signal }),

    post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
      request<T>("POST", path, { body, signal }),

    put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
      request<T>("PUT", path, { body, signal }),

    patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
      request<T>("PATCH", path, { body, signal }),

    delete: <T>(path: string, signal?: AbortSignal) =>
      request<T>("DELETE", path, { signal }),
  }
}
