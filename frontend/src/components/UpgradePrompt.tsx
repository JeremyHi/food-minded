import { Link } from 'react-router-dom'

type Feature =
  | 'regenerate'
  | 'export_pdf'
  | 'advanced_diets'
  | 'extended_days'
  | 'custom_macros'
  | 'smart_pricing'
  | 'unlimited_plans'

interface UpgradePromptProps {
  feature: Feature
  inline?: boolean
  onClose?: () => void
}

const FEATURE_MESSAGES: Record<Feature, { title: string; description: string }> = {
  regenerate: {
    title: 'Regenerate Your Meal Plan',
    description:
      "Don't love a meal? Pro members can regenerate their plans unlimited times until it's perfect.",
  },
  export_pdf: {
    title: 'Export Your Grocery List',
    description:
      'Take your shopping list anywhere! Pro members can export beautifully formatted PDF grocery lists.',
  },
  advanced_diets: {
    title: 'Access All Diet Types',
    description:
      'Unlock all 6 specialized diet types including Keto, Paleo, Mediterranean, and more.',
  },
  extended_days: {
    title: 'Plan Up to 14 Days',
    description:
      'Free plans are limited to 3 days. Upgrade to Pro to plan up to 2 weeks ahead!',
  },
  custom_macros: {
    title: 'Customize Your Macros',
    description:
      'Set your own protein, carb, and fat targets. Pro members have full control over their nutrition.',
  },
  smart_pricing: {
    title: 'Smart Multi-Store Pricing',
    description:
      'Compare prices across multiple stores and optimize your grocery budget with smart pricing.',
  },
  unlimited_plans: {
    title: "You've Hit Your Limit",
    description:
      "Free members get 1 meal plan per month. Upgrade to Pro for unlimited plans, or purchase a single plan for $2.99.",
  },
}

export default function UpgradePrompt({
  feature,
  inline = false,
  onClose,
}: UpgradePromptProps) {
  const { title, description } = FEATURE_MESSAGES[feature]

  if (inline) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-charcoal text-sm mb-1">{title}</h4>
            <p className="text-charcoal/60 text-sm mb-3">{description}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Upgrade to Pro
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              {feature === 'unlimited_plans' && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-charcoal/5 text-charcoal text-sm font-medium rounded-lg hover:bg-charcoal/10 transition-colors"
                >
                  Buy Single Plan - $2.99
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal style
  return (
    <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h3 className="font-display text-2xl mb-1">{title}</h3>
          <p className="text-white/80 text-sm">Unlock this feature with Pro</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-charcoal/70 text-center mb-6">{description}</p>

          {/* Pro benefits */}
          <div className="bg-cream rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-charcoal mb-3">
              Pro members also get:
            </p>
            <ul className="space-y-2">
              <ProBenefit text="Unlimited meal plans every month" />
              <ProBenefit text="Plan up to 14 days ahead" />
              <ProBenefit text="All 6 diet types" />
              <ProBenefit text="Custom macro settings" />
              <ProBenefit text="PDF grocery list export" />
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              to="/pricing"
              className="block w-full py-3 bg-primary-500 text-white text-center font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Upgrade to Pro - $9.99/month
            </Link>
            {feature === 'unlimited_plans' && (
              <Link
                to="/pricing"
                className="block w-full py-3 bg-charcoal/5 text-charcoal text-center font-semibold rounded-xl hover:bg-charcoal/10 transition-colors"
              >
                Or Buy a Single Plan - $2.99
              </Link>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="block w-full py-2 text-charcoal/50 text-sm hover:text-charcoal transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProBenefit({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-charcoal">
      <svg
        className="w-4 h-4 text-secondary-500 flex-shrink-0"
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
      {text}
    </li>
  )
}
