import { create } from 'zustand'
import type { MealPlan, Cart, Preferences } from '../types'

interface PlanState {
  preferences: Preferences | null
  currentPlan: MealPlan | null
  cart: Cart | null
  isLoading: boolean
  error: string | null

  setPreferences: (preferences: Preferences) => void
  setCurrentPlan: (plan: MealPlan) => void
  setCart: (cart: Cart) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearPlan: () => void
}

export const usePlanStore = create<PlanState>((set) => ({
  preferences: null,
  currentPlan: null,
  cart: null,
  isLoading: false,
  error: null,

  setPreferences: (preferences) => set({ preferences }),
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setCart: (cart) => set({ cart }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearPlan: () => set({ currentPlan: null, cart: null }),
}))
