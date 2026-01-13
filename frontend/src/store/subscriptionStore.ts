import { create } from 'zustand'
import { api } from '../api/client'

interface SubscriptionState {
  // Subscription info
  plan: 'free' | 'pro'
  status: 'none' | 'active' | 'canceled' | 'expired'
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean

  // Usage info
  isFirstPlan: boolean
  plansCreatedThisMonth: number
  plansLimit: number | string
  maxDays: number
  canCreatePlan: boolean
  usageMessage: string | null

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  fetchSubscription: () => Promise<void>
  fetchUsage: () => Promise<void>
  createCheckout: (mode: 'subscription' | 'payment') => Promise<string>
  openPortal: () => Promise<string>
  cancelSubscription: () => Promise<void>
  reset: () => void
}

const initialState = {
  plan: 'free' as const,
  status: 'none' as const,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isFirstPlan: true,
  plansCreatedThisMonth: 0,
  plansLimit: 1,
  maxDays: 3,
  canCreatePlan: true,
  usageMessage: null,
  isLoading: false,
  error: null,
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  ...initialState,

  fetchSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.billing.getSubscription()
      set({
        plan: data.plan as 'free' | 'pro',
        status: data.status as 'none' | 'active' | 'canceled' | 'expired',
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
      })
    }
  },

  fetchUsage: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.billing.getUsage()
      set({
        plan: data.plan as 'free' | 'pro',
        isFirstPlan: data.is_first_plan,
        plansCreatedThisMonth: data.plans_created_this_month,
        plansLimit: data.plans_limit,
        maxDays: data.max_days,
        canCreatePlan: data.can_create_plan,
        usageMessage: data.message,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch usage',
      })
    }
  },

  createCheckout: async (mode) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.billing.createCheckout(mode)
      set({ isLoading: false })
      return data.checkout_url
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout',
      })
      throw error
    }
  },

  openPortal: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.billing.createPortal()
      set({ isLoading: false })
      return data.portal_url
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to open billing portal',
      })
      throw error
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      await api.billing.cancelSubscription()
      set({
        cancelAtPeriodEnd: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      })
      throw error
    }
  },

  reset: () => set(initialState),
}))
