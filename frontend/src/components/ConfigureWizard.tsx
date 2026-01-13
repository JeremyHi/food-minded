import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import type { DietType, Allergy } from '../types'

const STEPS = [
  { id: 1, name: 'Diet', label: 'Nutrition Style' },
  { id: 2, name: 'Allergies', label: 'Family Safety' },
  { id: 3, name: 'Budget', label: 'Budget & Duration' },
  { id: 4, name: 'Variety', label: 'Meal Variety' },
  { id: 5, name: 'Summary', label: 'Review & Confirm' },
]

interface WizardState {
  selectedDiet: string
  selectedAllergies: string[]
  budgetMax: number
  mealDays: number
  dailyCalories: number
  variety: 'minimal' | 'moderate' | 'high'
}

export default function ConfigureWizard() {
  const navigate = useNavigate()
  const { setPreferences } = usePlanStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isAnimating, setIsAnimating] = useState(false)

  const [dietTypes, setDietTypes] = useState<DietType[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [state, setState] = useState<WizardState>({
    selectedDiet: '40-30-30',
    selectedAllergies: [],
    budgetMax: 150,
    mealDays: 7,
    dailyCalories: 2000,
    variety: 'moderate',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [typesRes, allergiesRes] = await Promise.all([
          api.diet.getTypes(),
          api.diet.getAllergies(),
        ])
        setDietTypes(typesRes.types)
        setAllergies(allergiesRes.allergies)
      } catch (err) {
        setError('Failed to load options')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const goToStep = (step: number) => {
    if (step === currentStep || isAnimating) return
    setDirection(step > currentStep ? 'forward' : 'backward')
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(step)
      setTimeout(() => setIsAnimating(false), 50)
    }, 200)
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) goToStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) goToStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setError('')
    setSaving(true)
    try {
      const prefs = await api.diet.savePreferences({
        diet_type: state.selectedDiet,
        allergies: state.selectedAllergies,
        budget_min: 50,
        budget_max: state.budgetMax,
        variety_level: state.variety,
        meal_days: state.mealDays,
        daily_calories: state.dailyCalories,
      })
      setPreferences(prefs)
      navigate('/plan')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const toggleAllergy = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedAllergies: prev.selectedAllergies.includes(id)
        ? prev.selectedAllergies.filter(a => a !== id)
        : [...prev.selectedAllergies, id]
    }))
  }

  const selectedDietInfo = dietTypes.find(d => d.id === state.selectedDiet)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-charcoal/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => step.id < currentStep && goToStep(step.id)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 ${
                  step.id === currentStep
                    ? 'bg-primary-500 text-white scale-110 shadow-lg'
                    : step.id < currentStep
                    ? 'bg-secondary-500 text-white cursor-pointer hover:scale-105'
                    : 'bg-charcoal/10 text-charcoal/40'
                }`}
                disabled={step.id > currentStep}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </button>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-charcoal/60">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <div
            className={`transition-all duration-300 ease-out ${
              isAnimating
                ? direction === 'forward'
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            {/* Step 1: Diet Type */}
            {currentStep === 1 && (
              <StepCard title="Choose Your Nutrition Style" subtitle="Select the approach that fits your family's health goals">
                <div className="space-y-3">
                  {dietTypes.map((diet, index) => (
                    <button
                      key={diet.id}
                      onClick={() => setState(prev => ({ ...prev, selectedDiet: diet.id }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        state.selectedDiet === diet.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-charcoal/10 hover:border-charcoal/20 hover:bg-charcoal/5'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-charcoal">{diet.name}</div>
                          <div className="text-sm text-charcoal/60 mt-0.5">{diet.description}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.selectedDiet === diet.id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-charcoal/20'
                        }`}>
                          {state.selectedDiet === diet.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-primary-600 mt-2 font-medium">
                        {diet.carb_pct}% Carbs · {diet.protein_pct}% Protein · {diet.fat_pct}% Fat
                      </div>
                    </button>
                  ))}
                </div>
              </StepCard>
            )}

            {/* Step 2: Allergies */}
            {currentStep === 2 && (
              <StepCard title="Family Allergies & Restrictions" subtitle="Keep your loved ones safe - we'll exclude these from all meals">
                <div className="grid grid-cols-2 gap-3">
                  {allergies.map((allergy, index) => (
                    <button
                      key={allergy.id}
                      onClick={() => toggleAllergy(allergy.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                        state.selectedAllergies.includes(allergy.id)
                          ? 'border-secondary-500 bg-secondary-50 shadow-md'
                          : 'border-charcoal/10 hover:border-charcoal/20'
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className={`text-2xl mb-1 ${state.selectedAllergies.includes(allergy.id) ? '' : 'grayscale opacity-50'}`}>
                        {getAllergyEmoji(allergy.id)}
                      </div>
                      <div className={`font-medium text-sm ${
                        state.selectedAllergies.includes(allergy.id) ? 'text-secondary-700' : 'text-charcoal/70'
                      }`}>
                        {allergy.name}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-charcoal/50 mt-4">
                  {state.selectedAllergies.length === 0
                    ? 'No allergies? Great! Just continue to the next step.'
                    : `${state.selectedAllergies.length} allergen${state.selectedAllergies.length > 1 ? 's' : ''} selected`}
                </p>
              </StepCard>
            )}

            {/* Step 3: Budget & Duration */}
            {currentStep === 3 && (
              <StepCard title="Budget & Planning" subtitle="Set your weekly grocery budget and planning duration">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-medium text-charcoal">Weekly Budget</label>
                      <span className="text-2xl font-bold text-primary-500">${state.budgetMax}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={state.budgetMax}
                      onChange={(e) => setState(prev => ({ ...prev, budgetMax: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-charcoal/50 mt-1">
                      <span>$50</span>
                      <span>$500</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-charcoal block mb-3">Plan Duration</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[3, 5, 7, 10, 14].map(days => (
                        <button
                          key={days}
                          onClick={() => setState(prev => ({ ...prev, mealDays: days }))}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            state.mealDays === days
                              ? 'bg-primary-500 text-white shadow-md'
                              : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
                          }`}
                        >
                          {days}
                          <span className="block text-xs opacity-70">days</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-charcoal block mb-3">Daily Calories (per person)</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setState(prev => ({ ...prev, dailyCalories: Math.max(1200, prev.dailyCalories - 100) }))}
                        className="w-12 h-12 rounded-xl bg-charcoal/5 text-charcoal/70 font-bold text-xl hover:bg-charcoal/10"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-charcoal">{state.dailyCalories}</span>
                        <span className="text-charcoal/50 ml-1">cal</span>
                      </div>
                      <button
                        onClick={() => setState(prev => ({ ...prev, dailyCalories: Math.min(4000, prev.dailyCalories + 100) }))}
                        className="w-12 h-12 rounded-xl bg-charcoal/5 text-charcoal/70 font-bold text-xl hover:bg-charcoal/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </StepCard>
            )}

            {/* Step 4: Variety */}
            {currentStep === 4 && (
              <StepCard title="Meal Variety Preference" subtitle="How much variety does your family want?">
                <div className="space-y-4">
                  {[
                    { id: 'minimal', title: 'Minimal', desc: 'Batch cooking, repeat meals', icon: '🍲', benefit: 'Less prep time, more efficiency' },
                    { id: 'moderate', title: 'Moderate', desc: 'Some variety daily', icon: '🥗', benefit: 'Best balance for families' },
                    { id: 'high', title: 'High', desc: 'Different meals every day', icon: '🌮', benefit: 'For adventurous eaters' },
                  ].map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => setState(prev => ({ ...prev, variety: option.id as WizardState['variety'] }))}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                        state.variety === option.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-charcoal/10 hover:border-charcoal/20'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-charcoal">{option.title}</div>
                          <div className="text-sm text-charcoal/60">{option.desc}</div>
                          <div className="text-xs text-primary-600 mt-1">{option.benefit}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          state.variety === option.id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-charcoal/20'
                        }`}>
                          {state.variety === option.id && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </StepCard>
            )}

            {/* Step 5: Summary */}
            {currentStep === 5 && (
              <StepCard title="Review Your Plan" subtitle="Make sure everything looks good before we create your meal plan">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-5 space-y-4">
                  <SummaryRow
                    label="Nutrition Style"
                    value={selectedDietInfo?.name || state.selectedDiet}
                    onEdit={() => goToStep(1)}
                  />
                  <SummaryRow
                    label="Allergies"
                    value={state.selectedAllergies.length > 0
                      ? state.selectedAllergies.map(id => allergies.find(a => a.id === id)?.name).join(', ')
                      : 'None'
                    }
                    onEdit={() => goToStep(2)}
                  />
                  <SummaryRow
                    label="Weekly Budget"
                    value={`$${state.budgetMax}`}
                    onEdit={() => goToStep(3)}
                  />
                  <SummaryRow
                    label="Plan Duration"
                    value={`${state.mealDays} days`}
                    onEdit={() => goToStep(3)}
                  />
                  <SummaryRow
                    label="Daily Calories"
                    value={`${state.dailyCalories} cal`}
                    onEdit={() => goToStep(3)}
                  />
                  <SummaryRow
                    label="Meal Variety"
                    value={state.variety.charAt(0).toUpperCase() + state.variety.slice(1)}
                    onEdit={() => goToStep(4)}
                    isLast
                  />
                </div>

                {selectedDietInfo && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-charcoal/10">
                    <div className="text-sm font-medium text-charcoal/60 mb-2">Daily Macro Targets</div>
                    <div className="flex justify-around">
                      <MacroCircle label="Carbs" value={Math.round(state.dailyCalories * selectedDietInfo.carb_pct / 100 / 4)} unit="g" color="primary" />
                      <MacroCircle label="Protein" value={Math.round(state.dailyCalories * selectedDietInfo.protein_pct / 100 / 4)} unit="g" color="secondary" />
                      <MacroCircle label="Fat" value={Math.round(state.dailyCalories * selectedDietInfo.fat_pct / 100 / 9)} unit="g" color="accent" />
                    </div>
                  </div>
                )}
              </StepCard>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 rounded-xl border-2 border-charcoal/20 text-charcoal font-semibold hover:bg-charcoal/5 transition-all"
            >
              Back
            </button>
          )}
          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex-1 btn-primary py-4"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 btn-primary py-4 disabled:opacity-50"
            >
              {saving ? 'Creating Plan...' : 'Create My Meal Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h2 className="font-display text-2xl text-charcoal mb-1">{title}</h2>
      <p className="text-charcoal/60 text-sm mb-6">{subtitle}</p>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, onEdit, isLast = false }: { label: string; value: string; onEdit: () => void; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${!isLast ? 'pb-3 border-b border-charcoal/10' : ''}`}>
      <div>
        <div className="text-xs text-charcoal/50 uppercase tracking-wide">{label}</div>
        <div className="font-medium text-charcoal">{value}</div>
      </div>
      <button
        onClick={onEdit}
        className="text-primary-500 text-sm font-medium hover:text-primary-600"
      >
        Edit
      </button>
    </div>
  )
}

function MacroCircle({ label, value, unit, color }: { label: string; value: number; unit: string; color: 'primary' | 'secondary' | 'accent' }) {
  const colors = {
    primary: 'text-primary-500 bg-primary-100',
    secondary: 'text-secondary-500 bg-secondary-100',
    accent: 'text-accent-600 bg-accent-100',
  }
  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full ${colors[color]} flex items-center justify-center mx-auto mb-1`}>
        <span className="font-bold">{value}</span>
        <span className="text-xs">{unit}</span>
      </div>
      <div className="text-xs text-charcoal/60">{label}</div>
    </div>
  )
}

function getAllergyEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'tree-nuts': '🌰',
    'peanuts': '🥜',
    'dairy': '🥛',
    'eggs': '🥚',
    'wheat': '🌾',
    'soy': '🫘',
    'fish': '🐟',
    'shellfish': '🦐',
  }
  return emojis[id] || '⚠️'
}
