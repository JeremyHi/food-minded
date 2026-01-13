import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSubscriptionStore } from '../store/subscriptionStore'

export default function BillingSuccess() {
  const [searchParams] = useSearchParams()
  const { fetchSubscription, fetchUsage } = useSubscriptionStore()
  const [loading, setLoading] = useState(true)

  const purchaseType = searchParams.get('type')
  const isSubscription = purchaseType !== 'single'

  useEffect(() => {
    const loadData = async () => {
      // Give Stripe webhook a moment to process
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await Promise.all([fetchSubscription(), fetchUsage()])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal/60">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-secondary-600"
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
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl text-charcoal mb-2">
            {isSubscription ? 'Welcome to Pro!' : 'Purchase Complete!'}
          </h1>

          <p className="text-charcoal/60 mb-8 max-w-md mx-auto">
            {isSubscription
              ? "You now have unlimited access to all Food Minded features. Let's create your perfect meal plan!"
              : "Your pro-tier meal plan is ready. Enjoy all premium features for this plan!"}
          </p>

          {/* Plan Details Card */}
          <div className="bg-cream rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-charcoal mb-4">What you get:</h3>
            <ul className="space-y-3">
              <FeatureRow
                icon="calendar"
                text={isSubscription ? 'Unlimited meal plans' : '1 pro-quality meal plan'}
              />
              <FeatureRow
                icon="clock"
                text="Up to 14 days of planning"
              />
              <FeatureRow
                icon="sparkles"
                text="All 6 diet types available"
              />
              <FeatureRow
                icon="sliders"
                text="Custom macro settings"
              />
              <FeatureRow
                icon="refresh"
                text={isSubscription ? 'Unlimited regenerations' : '1 regeneration included'}
              />
              <FeatureRow
                icon="document"
                text="PDF grocery list export"
              />
              <FeatureRow
                icon="shopping"
                text="Smart multi-store pricing"
              />
              {isSubscription && (
                <FeatureRow
                  icon="support"
                  text="Priority email support"
                />
              )}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/configure"
              className="btn-primary px-6 py-3 text-center"
            >
              Create Your Meal Plan
            </Link>
            <Link
              to="/billing"
              className="px-6 py-3 bg-charcoal/5 text-charcoal rounded-xl font-semibold hover:bg-charcoal/10 transition-colors text-center"
            >
              View Billing Details
            </Link>
          </div>

          {/* Subscription Details */}
          {isSubscription && (
            <p className="mt-6 text-sm text-charcoal/50">
              You can manage your subscription anytime from the{' '}
              <Link to="/billing" className="text-primary-500 hover:underline">
                billing page
              </Link>
              .
            </p>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-charcoal/50 text-sm">
            Questions about your purchase?{' '}
            <a
              href="mailto:support@foodminded.com"
              className="text-primary-500 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  const icons: Record<string, JSX.Element> = {
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    sparkles: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    ),
    sliders: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    ),
    refresh: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    ),
    document: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    shopping: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
    support: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
  }

  return (
    <li className="flex items-center gap-3">
      <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-secondary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </div>
      <span className="text-charcoal">{text}</span>
    </li>
  )
}
