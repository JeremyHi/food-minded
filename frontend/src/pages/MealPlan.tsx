import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'

// Mock data for demo/screenshots
const MOCK_PLAN = {
  id: 'demo-plan-001',
  days: [
    {
      day: 1,
      meals: [
        { type: 'breakfast', name: 'Greek Yogurt Parfait with Berries', macros: { calories: 320, protein_g: 18, carbs_g: 42, fat_g: 8 } },
        { type: 'lunch', name: 'Grilled Chicken Caesar Salad', macros: { calories: 450, protein_g: 35, carbs_g: 18, fat_g: 28 } },
        { type: 'dinner', name: 'Herb-Crusted Salmon with Quinoa', macros: { calories: 520, protein_g: 42, carbs_g: 35, fat_g: 22 } },
        { type: 'snack', name: 'Apple Slices with Almond Butter', macros: { calories: 210, protein_g: 5, carbs_g: 24, fat_g: 12 } },
      ],
      daily_totals: { calories: 1500, protein_g: 100, carbs_g: 119, fat_g: 70 }
    },
    {
      day: 2,
      meals: [
        { type: 'breakfast', name: 'Spinach & Feta Egg White Omelette', macros: { calories: 280, protein_g: 24, carbs_g: 8, fat_g: 16 } },
        { type: 'lunch', name: 'Turkey & Avocado Wrap', macros: { calories: 420, protein_g: 28, carbs_g: 38, fat_g: 18 } },
        { type: 'dinner', name: 'Lean Beef Stir-Fry with Brown Rice', macros: { calories: 550, protein_g: 38, carbs_g: 48, fat_g: 22 } },
        { type: 'snack', name: 'Mixed Nuts & Dark Chocolate', macros: { calories: 250, protein_g: 6, carbs_g: 18, fat_g: 18 } },
      ],
      daily_totals: { calories: 1500, protein_g: 96, carbs_g: 112, fat_g: 74 }
    },
    {
      day: 3,
      meals: [
        { type: 'breakfast', name: 'Overnight Oats with Banana', macros: { calories: 350, protein_g: 12, carbs_g: 58, fat_g: 8 } },
        { type: 'lunch', name: 'Mediterranean Quinoa Bowl', macros: { calories: 480, protein_g: 18, carbs_g: 52, fat_g: 22 } },
        { type: 'dinner', name: 'Grilled Chicken with Sweet Potato', macros: { calories: 490, protein_g: 40, carbs_g: 42, fat_g: 16 } },
        { type: 'snack', name: 'Hummus with Veggie Sticks', macros: { calories: 180, protein_g: 6, carbs_g: 20, fat_g: 8 } },
      ],
      daily_totals: { calories: 1500, protein_g: 76, carbs_g: 172, fat_g: 54 }
    },
  ],
  shopping_list: [
    { name: 'Chicken Breast (2 lbs)', estimated_price: 12.99, quantity: 1 },
    { name: 'Salmon Fillet (1 lb)', estimated_price: 14.99, quantity: 1 },
    { name: 'Greek Yogurt (32oz)', estimated_price: 5.99, quantity: 1 },
    { name: 'Mixed Berries (frozen)', estimated_price: 4.99, quantity: 1 },
    { name: 'Quinoa (1 lb bag)', estimated_price: 6.99, quantity: 1 },
    { name: 'Brown Rice (2 lb bag)', estimated_price: 4.49, quantity: 1 },
    { name: 'Mixed Greens (5oz)', estimated_price: 4.99, quantity: 2 },
    { name: 'Sweet Potatoes (3 lb)', estimated_price: 3.99, quantity: 1 },
    { name: 'Avocados (4 pack)', estimated_price: 5.99, quantity: 1 },
    { name: 'Eggs (dozen)', estimated_price: 4.99, quantity: 1 },
    { name: 'Almond Butter (16oz)', estimated_price: 8.99, quantity: 1 },
    { name: 'Hummus (10oz)', estimated_price: 4.49, quantity: 1 },
  ],
  total_cost_estimate: 89.86,
}

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  macros: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
}

function MealCard({ meal, index }: { meal: Meal; index: number }) {
  const typeConfig = {
    breakfast: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '🌅' },
    lunch: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '☀️' },
    dinner: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: '🌙' },
    snack: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '🍎' },
  }
  const config = typeConfig[meal.type]

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all hover:shadow-md`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${config.text}`}>
          {meal.type}
        </span>
        <span className="ml-auto text-sm font-medium text-charcoal/60">{meal.macros.calories} cal</span>
      </div>
      <h4 className="font-semibold text-charcoal mb-2 leading-tight">{meal.name}</h4>
      <div className="flex gap-3 text-xs text-charcoal/50">
        <span className="bg-white/50 px-2 py-1 rounded">P: {meal.macros.protein_g}g</span>
        <span className="bg-white/50 px-2 py-1 rounded">C: {meal.macros.carbs_g}g</span>
        <span className="bg-white/50 px-2 py-1 rounded">F: {meal.macros.fat_g}g</span>
      </div>
    </div>
  )
}

export default function MealPlan() {
  const navigate = useNavigate()
  const { setCart } = usePlanStore()
  const { logout } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateCart = () => {
    // Create mock cart and navigate
    setCart({
      id: 'demo-cart-001',
      items: MOCK_PLAN.shopping_list.map((item, idx) => ({
        id: `item-${idx}`,
        name: item.name,
        quantity: item.quantity,
        price: item.estimated_price,
        checked: true,
      })),
      total: MOCK_PLAN.total_cost_estimate,
    })
    navigate('/cart')
  }

  const handleRegenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-charcoal/60">Creating your perfect meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="font-display text-xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/configure" className="text-sm text-charcoal/60 hover:text-primary-500">
              Edit Plan
            </Link>
            <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        {/* Plan Header Card */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl mb-1">Your Family's Meal Plan</h1>
              <p className="text-white/80">
                {MOCK_PLAN.days.length} days · {MOCK_PLAN.shopping_list.length} ingredients · ~${MOCK_PLAN.total_cost_estimate.toFixed(0)} budget
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {generating ? 'Regenerating...' : '🔄 Regenerate'}
              </button>
            </div>
          </div>
        </div>

        {/* Day Cards */}
        <div className="space-y-6 mb-8">
          {MOCK_PLAN.days.map((day) => (
            <div key={day.day} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-charcoal/5 px-5 py-3 flex items-center justify-between">
                <h2 className="font-display text-lg text-charcoal">Day {day.day}</h2>
                <div className="text-sm text-charcoal/60">
                  {day.daily_totals.calories} cal · {day.daily_totals.protein_g}g protein
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 gap-3">
                {day.meals.map((meal, idx) => (
                  <MealCard key={idx} meal={meal} index={idx} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Shopping List Preview */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-charcoal">Shopping List</h2>
            <span className="text-sm text-charcoal/60">{MOCK_PLAN.shopping_list.length} items</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MOCK_PLAN.shopping_list.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-charcoal/5 rounded-xl">
                <span className="text-sm text-charcoal">{item.name}</span>
                <span className="text-sm font-medium text-primary-600">${item.estimated_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          {MOCK_PLAN.shopping_list.length > 6 && (
            <p className="text-sm text-charcoal/50 mt-3 text-center">
              +{MOCK_PLAN.shopping_list.length - 6} more items in your cart
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleCreateCart}
          className="w-full btn-primary py-4 text-lg"
        >
          Review Shopping Cart →
        </button>
      </div>
    </div>
  )
}
