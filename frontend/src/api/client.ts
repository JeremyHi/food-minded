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

  billing: {
    getPlans: () =>
      request<{
        free: PricingPlan
        pro: PricingPlan
        single: PricingPlan
      }>('/billing/plans'),

    createCheckout: (mode: 'subscription' | 'payment') =>
      request<{ checkout_url: string; session_id: string }>('/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ mode }),
      }),

    createPortal: () =>
      request<{ portal_url: string }>('/billing/create-portal-session', {
        method: 'POST',
      }),

    getSubscription: () =>
      request<SubscriptionStatus>('/billing/subscription'),

    getUsage: () =>
      request<UsageStatus>('/billing/usage'),

    cancelSubscription: () =>
      request<{ success: boolean; message: string }>('/billing/cancel-subscription', {
        method: 'POST',
      }),

    getPayments: (limit = 10) =>
      request<{ payments: PaymentHistoryItem[] }>(`/billing/payments?limit=${limit}`),
  },
}

// Billing types
interface PlanFeatures {
  plans_per_month: number | string
  max_days: number
  diet_types: string
  can_customize_macros: boolean
  can_regenerate: boolean
  can_export_pdf: boolean
  smart_pricing: boolean
  priority_support: boolean
}

interface PricingPlan {
  name: string
  price_cents: number
  interval: string | null
  features: PlanFeatures
}

interface SubscriptionStatus {
  plan: string
  status: string
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

interface UsageStatus {
  plan: string
  is_first_plan: boolean
  plans_created_this_month: number
  plans_limit: number | string
  can_create_plan: boolean
  max_days: number
  message: string | null
}

interface PaymentHistoryItem {
  id: number
  amount_paid: number
  currency: string
  status: string
  description: string | null
  invoice_url: string | null
  created_at: string
}
