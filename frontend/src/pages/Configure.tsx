import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'
import type { DietType, Allergy } from '../types'

export default function Configure() {
  const navigate = useNavigate()
  const { setPreferences } = usePlanStore()
  const { logout } = useAuthStore()

  const [dietTypes, setDietTypes] = useState<DietType[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [selectedDiet, setSelectedDiet] = useState('40-30-30')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState(50)
  const [budgetMax, setBudgetMax] = useState(150)
  const [variety, setVariety] = useState<'minimal' | 'moderate' | 'high'>('moderate')
  const [mealDays, setMealDays] = useState(7)
  const [dailyCalories, setDailyCalories] = useState(2000)

  useEffect(() => {
    async function loadData() {
      try {
        const [typesRes, allergiesRes] = await Promise.all([
          api.diet.getTypes(),
          api.diet.getAllergies(),
        ])
        setDietTypes(typesRes.types)
        setAllergies(allergiesRes.allergies)

        // Try to load existing preferences
        try {
          const prefs = await api.diet.getPreferences()
          setSelectedDiet(prefs.diet_type)
          setSelectedAllergies(prefs.allergies)
          setBudgetMin(prefs.budget_min)
          setBudgetMax(prefs.budget_max)
          setVariety(prefs.variety_level)
          setMealDays(prefs.meal_days)
          setDailyCalories(prefs.daily_calories)
        } catch {
          // No existing preferences, use defaults
        }
      } catch (err) {
        setError('Failed to load configuration options')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const prefs = await api.diet.savePreferences({
        diet_type: selectedDiet,
        allergies: selectedAllergies,
        budget_min: budgetMin,
        budget_max: budgetMax,
        variety_level: variety,
        meal_days: mealDays,
        daily_calories: dailyCalories,
      })
      setPreferences(prefs)
      navigate('/plan')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const toggleAllergy = (id: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const selectedDietInfo = dietTypes.find((d) => d.id === selectedDiet)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-charcoal/50">Loading your preferences...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
          <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
            Logout
          </button>
        </div>

        <h1 className="font-display text-3xl mb-2 text-charcoal">Plan Your Family's Meals</h1>
        <p className="text-charcoal/60 mb-8">
          Tell us about your family's needs and we'll create a personalized meal plan that everyone will love.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Diet Type Selection */}
          <div className="card">
            <h2 className="font-display text-xl mb-2 text-charcoal">Nutrition Style</h2>
            <p className="text-sm text-charcoal/50 mb-4">Choose a balanced approach that fits your family's goals.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {dietTypes.map((diet) => (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => setSelectedDiet(diet.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDiet === diet.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-charcoal/10 hover:border-charcoal/20'
                  }`}
                >
                  <div className="font-medium text-charcoal">{diet.name}</div>
                  <div className="text-sm text-charcoal/60 mt-1">{diet.description}</div>
                  <div className="text-xs text-primary-600 mt-2">
                    {diet.carb_pct}% C / {diet.protein_pct}% P / {diet.fat_pct}% F
                  </div>
                </button>
              ))}
            </div>
            {selectedDietInfo && (
              <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                <div className="text-sm font-medium text-primary-700">Daily Nutrition Targets</div>
                <div className="flex gap-6 mt-2 text-sm text-charcoal/70">
                  <span>Carbs: {Math.round(dailyCalories * selectedDietInfo.carb_pct / 100 / 4)}g</span>
                  <span>Protein: {Math.round(dailyCalories * selectedDietInfo.protein_pct / 100 / 4)}g</span>
                  <span>Fat: {Math.round(dailyCalories * selectedDietInfo.fat_pct / 100 / 9)}g</span>
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="card">
            <h2 className="font-display text-xl mb-2 text-charcoal">Family Allergies & Restrictions</h2>
            <p className="text-sm text-charcoal/50 mb-4">
              Keep your family safe. We'll automatically exclude these from all meal suggestions.
            </p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <button
                  key={allergy.id}
                  type="button"
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedAllergies.includes(allergy.id)
                      ? 'bg-secondary-500 text-white'
                      : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
                  }`}
                >
                  {allergy.name}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Duration */}
          <div className="card">
            <h2 className="font-display text-xl mb-2 text-charcoal">Budget & Planning</h2>
            <p className="text-sm text-charcoal/50 mb-4">Set your grocery budget and how many days to plan ahead.</p>

            <div className="space-y-6">
              <div>
                <label className="label text-charcoal">
                  Weekly Grocery Budget: ${budgetMin} - ${budgetMax}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="label text-charcoal">Plan Duration: {mealDays} days</label>
                <div className="flex gap-2 flex-wrap">
                  {[3, 5, 7, 10, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setMealDays(days)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        mealDays === days
                          ? 'bg-primary-500 text-white'
                          : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
                      }`}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label text-charcoal">Daily Calories (per person)</label>
                <input
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(parseInt(e.target.value))}
                  min="1200"
                  max="4000"
                  step="100"
                  className="input w-32"
                />
                <p className="text-xs text-charcoal/40 mt-1">Adjust based on your family's needs</p>
              </div>
            </div>
          </div>

          {/* Variety Level */}
          <div className="card">
            <h2 className="font-display text-xl mb-2 text-charcoal">Meal Variety</h2>
            <p className="text-sm text-charcoal/50 mb-4">How much variety does your family want?</p>
            <div className="flex gap-4 flex-wrap">
              {(['minimal', 'moderate', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setVariety(level)}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 text-center transition-all ${
                    variety === level
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-charcoal/10 hover:border-charcoal/20'
                  }`}
                >
                  <div className="font-medium capitalize text-charcoal">{level}</div>
                  <div className="text-xs text-charcoal/50 mt-1">
                    {level === 'minimal' && 'Batch cooking, less prep'}
                    {level === 'moderate' && 'Good balance for families'}
                    {level === 'high' && 'New meals every day'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {saving ? 'Creating Your Family\'s Plan...' : 'Create My Family\'s Meal Plan'}
          </button>
        </form>
      </div>
    </div>
  )
}
