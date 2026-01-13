import { useState, useCallback } from 'react'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import type { MealPlan } from '../types'

/**
 * Hook to manage meal plan state and actions
 */
export function useMealPlan() {
  const { currentPlan, setCurrentPlan, preferences, setPreferences } = usePlanStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePlan = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const plan = await api.meals.generate(preferences?.id)
      setCurrentPlan(plan)
      return plan
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [preferences?.id, setCurrentPlan])

  const loadPlan = useCallback(async (planId: number): Promise<MealPlan> => {
    setIsLoading(true)
    setError(null)

    try {
      const plan = await api.meals.get(planId)
      setCurrentPlan(plan)
      return plan
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plan'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [setCurrentPlan])

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await api.diet.getPreferences()
      setPreferences(prefs)
      return prefs
    } catch {
      // No preferences set yet
      return null
    }
  }, [setPreferences])

  return {
    plan: currentPlan,
    preferences,
    isLoading,
    error,
    generatePlan,
    loadPlan,
    loadPreferences,
  }
}
