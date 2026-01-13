import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'
import type { MealPlan as MealPlanType, Meal } from '../types'

function MealCard({ meal }: { meal: Meal }) {
  const typeColors = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-green-100 text-green-800',
    dinner: 'bg-blue-100 text-blue-800',
    snack: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${typeColors[meal.type]}`}>
          {meal.type}
        </span>
        <span className="text-sm text-gray-500">{meal.macros.calories} cal</span>
      </div>
      <h4 className="font-medium text-charcoal mb-2">{meal.name}</h4>
      <div className="flex gap-3 text-xs text-gray-500">
        <span>P: {meal.macros.protein_g}g</span>
        <span>C: {meal.macros.carbs_g}g</span>
        <span>F: {meal.macros.fat_g}g</span>
      </div>
    </div>
  )
}

export default function MealPlan() {
  const navigate = useNavigate()
  const { currentPlan, setCurrentPlan, setCart } = usePlanStore()
  const { logout } = useAuthStore()

  const [plan, setPlan] = useState<MealPlanType | null>(currentPlan)
  const [loading, setLoading] = useState(!currentPlan)
  const [generating, setGenerating] = useState(false)
  const [creatingCart, setCreatingCart] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPlan() {
      if (currentPlan) {
        setPlan(currentPlan)
        setLoading(false)
        return
      }

      try {
        // Try to get existing plans
        const plans = await api.meals.list(1)
        if (plans.length > 0) {
          setPlan(plans[0])
          setCurrentPlan(plans[0])
        } else {
          // Generate new plan
          await generatePlan()
        }
      } catch {
        setError('Failed to load meal plan')
      } finally {
        setLoading(false)
      }
    }
    loadPlan()
  }, [])

  const generatePlan = async () => {
    setGenerating(true)
    setError('')
    try {
      const newPlan = await api.meals.generate()
      setPlan(newPlan)
      setCurrentPlan(newPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleCreateCart = async () => {
    if (!plan) return
    setCreatingCart(true)
    try {
      const cart = await api.cart.create(plan.id)
      setCart(cart)
      navigate('/cart')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cart')
    } finally {
      setCreatingCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/configure" className="text-sm text-gray-600 hover:text-primary-500">
              Edit Preferences
            </Link>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {plan ? (
          <>
            {/* Plan Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl">Your Meal Plan</h1>
                <p className="text-gray-600">
                  {plan.plan_data.days.length} days · ${plan.total_cost_estimate.toFixed(2)} estimated
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="btn-outline"
                >
                  {generating ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  onClick={handleCreateCart}
                  disabled={creatingCart}
                  className="btn-primary"
                >
                  {creatingCart ? 'Creating Cart...' : 'Review Cart'}
                </button>
              </div>
            </div>

            {/* Day Cards */}
            <div className="space-y-8">
              {plan.plan_data.days.map((day) => (
                <div key={day.day} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl">Day {day.day}</h2>
                    <div className="text-sm text-gray-500">
                      {day.daily_totals.calories} cal · {day.daily_totals.protein_g}g P ·{' '}
                      {day.daily_totals.carbs_g}g C · {day.daily_totals.fat_g}g F
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {day.meals.map((meal, idx) => (
                      <MealCard key={idx} meal={meal} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping List Preview */}
            <div className="card mt-8">
              <h2 className="font-display text-xl mb-4">Shopping List Preview</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.plan_data.shopping_list.slice(0, 9).map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm text-gray-500">${item.estimated_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {plan.plan_data.shopping_list.length > 9 && (
                <p className="text-sm text-gray-500 mt-3">
                  +{plan.plan_data.shopping_list.length - 9} more items
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="font-display text-2xl mb-4">No Meal Plan Yet</h2>
            <p className="text-gray-600 mb-6">
              Generate your first meal plan based on your preferences.
            </p>
            <button onClick={generatePlan} disabled={generating} className="btn-primary">
              {generating ? 'Generating...' : 'Generate Meal Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
