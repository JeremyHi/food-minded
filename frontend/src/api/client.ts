import type {
  AuthResponse,
  DietType,
  Allergy,
  Preferences,
  MealPlan,
  Cart,
  CartItem,
  Order,
} from '../types'

const API_BASE = '/api'

interface ApiError {
  detail: string
  code?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }))
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<{ id: number; email: string; created_at: string }>('/auth/me'),
  },

  diet: {
    getTypes: () =>
      request<{ types: DietType[] }>('/diet/types'),

    getAllergies: () =>
      request<{ allergies: Allergy[] }>('/diet/allergies'),

    getPreferences: () =>
      request<Preferences>('/diet/preferences'),

    savePreferences: (prefs: Partial<Preferences>) =>
      request<Preferences>('/diet/preferences', {
        method: 'POST',
        body: JSON.stringify(prefs),
      }),
  },

  meals: {
    generate: (preferencesId?: number) =>
      request<MealPlan>('/meals/generate', {
        method: 'POST',
        body: JSON.stringify({ preferences_id: preferencesId }),
      }),

    get: (planId: number) =>
      request<MealPlan>(`/meals/${planId}`),

    list: (limit = 10) =>
      request<MealPlan[]>(`/meals/?limit=${limit}`),
  },

  cart: {
    create: (mealPlanId: number) =>
      request<Cart>('/cart/create', {
        method: 'POST',
        body: JSON.stringify({ meal_plan_id: mealPlanId }),
      }),

    get: (cartId: string) =>
      request<Cart>(`/cart/${cartId}`),

    update: (cartId: string, items: CartItem[]) =>
      request<Cart>(`/cart/${cartId}/items`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),

    checkout: (cartId: string) =>
      request<Order>('/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      }),
  },

  orders: {
    list: (limit = 10) =>
      request<Order[]>(`/cart/orders/?limit=${limit}`),
  },
}
