import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

const PLANS = {
  free: {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Food Minded',
    features: [
      '1 meal plan per month',
      'Up to 3 days of planning',
      'Basic diet types (Balanced, Zone)',
      'Allergy filtering',
      'Standard grocery list',
    ],
    limitations: [
      'No custom macros',
      'No plan regeneration',
      'No PDF export',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For families who plan ahead',
    features: [
      'Unlimited meal plans',
      'Up to 14 days of planning',
      'All 6 diet types',
      'Custom macro settings',
      'Unlimited regenerations',
      'PDF grocery list export',
      'Smart multi-store pricing',
      'Priority support',
    ],
    limitations: [],
    cta: 'Subscribe',
    highlighted: true,
  },
  single: {
    name: 'Single Plan',
    price: '$2.99',
    period: 'one-time',
    description: 'When you just need one great plan',
    features: [
      '1 pro-quality meal plan',
      'Up to 14 days of planning',
      'All 6 diet types',
      'Custom macro settings',
      '1 regeneration included',
      'PDF grocery list export',
      'Smart multi-store pricing',
    ],
    limitations: [],
    cta: 'Buy Now',
    highlighted: false,
  },
}

export default function Pricing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { createCheckout, isLoading } = useSubscriptionStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planKey: string) => {
    if (planKey === 'free') {
      navigate(isAuthenticated ? '/configure' : '/register')
      return
    }

    if (!isAuthenticated) {
      navigate('/register')
      return
    }

    setLoadingPlan(planKey)
    try {
      const mode = planKey === 'pro' ? 'subscription' : 'payment'
      const checkoutUrl = await createCheckout(mode)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/configure" className="text-charcoal/60 hover:text-primary-500">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-charcoal/60 hover:text-primary-500">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
          Nourish Your Family Without Limits
        </h1>
        <p className="text-charcoal/60 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your family. Start free and upgrade anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white rounded-2xl shadow-soft p-6 flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-primary-500 relative'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl text-charcoal mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl text-charcoal">
                    {plan.price}
                  </span>
                  <span className="text-charcoal/50 text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="text-charcoal/60 text-sm mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-charcoal">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <li key={`lim-${idx}`} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-charcoal/30 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-charcoal/50">{limitation}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(key)}
                disabled={isLoading || loadingPlan === key}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                } disabled:opacity-50`}
              >
                {loadingPlan === key ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* First Plan Free Banner */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white text-center">
          <h3 className="font-display text-xl mb-2">
            Your First Meal Plan is Always Free
          </h3>
          <p className="text-white/80 text-sm mb-4">
            New users get their first meal plan with full Pro features at no cost.
            Experience the magic before you decide.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block bg-white text-secondary-600 px-6 py-2 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Try It Free
            </Link>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-charcoal text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5">
              <h4 className="font-semibold text-charcoal mb-2">
                Can I cancel my subscription anytime?
              </h4>
              <p className="text-charcoal/60 text-sm">
                Yes! You can cancel your Pro subscription at any time. You'll continue
                to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h4 className="font-semibold text-charcoal mb-2">
                What happens after my first free plan?
              </h4>
              <p className="text-charcoal/60 text-sm">
                After your first plan, you'll be on the Free tier (1 plan/month, 3 days max).
                You can upgrade to Pro anytime or purchase individual plans for $2.99.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h4 className="font-semibold text-charcoal mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-charcoal/60 text-sm">
                We accept all major credit cards, Apple Pay, Google Pay, and more
                through our secure payment partner, Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-charcoal/10">
        <div className="max-w-6xl mx-auto text-center text-charcoal/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Food Minded. Nourish your family without the stress.</p>
        </div>
      </footer>
    </div>
  )
}
