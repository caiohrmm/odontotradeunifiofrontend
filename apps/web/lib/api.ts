const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export interface AuthResponse {
  token: string
  type: string
  userId: string
  email: string
  name: string
  role: string
}

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ListingSummaryResponse {
  id: string
  sellerId: string
  sellerName: string
  categoryId: string | null
  categoryName: string | null
  title: string
  price: number
  status: string
  imageUrls: string[]
  createdAt: string
}

export interface ListingResponse {
  id: string
  sellerId: string
  sellerName: string
  categoryId: string | null
  categoryName: string | null
  title: string
  description: string | null
  price: number
  status: "ACTIVE" | "SOLD" | "RESERVED"
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body: ApiResponse<T> = await res.json()

  if (!res.ok) {
    throw new Error(body.message ?? "Erro na requisição")
  }

  return body.data
}

// Server-side fetch — sem localStorage, usado em Server Components
async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  })
  const body: ApiResponse<T> = await res.json()
  if (!res.ok) throw new Error(body.message ?? "Erro na requisição")
  return body.data
}

export interface ListingParams {
  status?: string
  sellerId?: string
  categoryId?: string
  search?: string
  page?: number
  size?: number
}

export const listingsApi = {
  list(params: ListingParams = {}) {
    const qs = new URLSearchParams()
    if (params.status) qs.set("status", params.status)
    if (params.sellerId) qs.set("sellerId", params.sellerId)
    if (params.categoryId) qs.set("categoryId", params.categoryId)
    if (params.search) qs.set("search", params.search)
    if (params.page !== undefined) qs.set("page", String(params.page))
    if (params.size !== undefined) qs.set("size", String(params.size))
    const query = qs.size ? `?${qs.toString()}` : ""
    return serverFetch<PagedResponse<ListingSummaryResponse>>(`/api/v1/listings${query}`)
  },
  getById(id: string) {
    return serverFetch<ListingResponse>(`/api/v1/listings/${id}`)
  },
  create(data: CreateListingPayload) {
    return apiFetch<ListingResponse>("/api/v1/listings", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: string, data: UpdateListingPayload) {
    return apiFetch<ListingResponse>(`/api/v1/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  listByUser(userId: string) {
    return apiFetch<PagedResponse<ListingSummaryResponse>>(
      `/api/v1/listings?sellerId=${userId}&size=100`
    )
  },
  delete(id: string) {
    return apiFetch<null>(`/api/v1/listings/${id}`, { method: "DELETE" })
  },
}

export const categoriesApi = {
  list() {
    return serverFetch<CategoryResponse[]>("/api/v1/categories")
  },
}

export interface UploadResponse {
  url: string
}

export interface CreateListingPayload {
  title: string
  description?: string
  price?: number
  categoryId?: string
  imageUrls?: string[]
}

export interface UpdateListingPayload {
  title?: string
  description?: string
  price?: number
  status?: "ACTIVE" | "SOLD" | "RESERVED"
  categoryId?: string
  imageUrls?: string[]
}

export const uploadApi = {
  upload(file: File) {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<UploadResponse>("/api/v1/upload", {
      method: "POST",
      body: form,
    })
  },
}

export interface UserMeResponse {
  id: string
  email: string
  name: string
  role: string
}

export const userApi = {
  me() {
    return apiFetch<UserMeResponse>("/api/v1/users/me")
  },
  updateProfile(data: { name: string; email: string }) {
    return apiFetch<UserMeResponse>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiFetch<null>("/api/v1/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
}

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
  register(name: string, email: string, password: string) {
    return apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },
}
