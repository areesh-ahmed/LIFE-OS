const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Use 'include' on client side to send cookies, 'omit' during SSR
  const credentials = typeof window !== 'undefined' ? 'include' : 'omit'

  const actualResponse = await fetch(url, {
    ...options,
    headers,
    credentials,
  })

  if (actualResponse.status === 204) {
    return {} as T
  }

  const data = await actualResponse.json().catch(() => null)

  if (!actualResponse.ok) {
    throw new ApiError(
      actualResponse.status,
      data?.error?.code || 'UNKNOWN_ERROR',
      data?.error?.message || 'An error occurred'
    )
  }

  return data
}
