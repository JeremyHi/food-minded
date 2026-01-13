import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { api } from '../api/client'

interface PaymentHistoryItem {
  id: number
  amount_paid: number
  currency: string
  status: string
  description: string | null
  invoice_url: string | null
  created_at: string
}

export default function Billing() {
  const {
    plan,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isFirstPlan,
    plansCreatedThisMonth,
    plansLimit,
    maxDays,
    canCreatePlan,
    usageMessage,
    fetchSubscription,
    fetchUsage,
    openPortal,
    cancelSubscription,
  } = useSubscriptionStore()

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    fetchSubscription()
    fetchUsage()
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setPaymentsLoading(true)
    try {
      const data = await api.billing.getPayments(10)
      setPayments(data.payments)
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setPaymentsLoading(false)
    }
  }

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const portalUrl = await openPortal()
      window.location.href = portalUrl
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setCancelLoading(true)
    try {
      await cancelSubscription()
      setShowCancelModal(false)
      fetchSubscription()
    } catch (error) {
      console.error('Cancel error:', error)
    } finally {
      setCancelLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const getPlanDisplayName = () => {
    if (plan === 'pro') return 'Pro'
    return 'Free'
  }

  const getStatusBadge = () => {
    if (plan === 'free') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-charcoal/10 text-charcoal rounded-full">
          Free Tier
        </span>
      )
    }
    if (cancelAtPeriodEnd) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
          Canceling
        </span>
      )
    }
    if (status === 'active') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
          Active
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-charcoal/10 text-charcoal rounded-full">
        {status}
      </span>
    )
  }

  const usagePercentage = typeof plansLimit === 'number'
    ? Math.min((plansCreatedThisMonth / plansLimit) * 100, 100)
    : 0

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-4 py-6 border-b border-charcoal/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/configure" className="text-charcoal/60 hover:text-primary-500">
              Dashboard
            </Link>
            <Link to="/pricing" className="text-charcoal/60 hover:text-primary-500">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-8">Billing & Subscription</h1>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-xl text-charcoal mb-1">Current Plan</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-charcoal">
                    {getPlanDisplayName()}
                  </span>
                  {getStatusBadge()}
                </div>
              </div>
              {plan === 'pro' && (
                <div className="text-right">
                  <p className="text-sm text-charcoal/60">
                    {cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
                  </p>
                  <p className="font-medium text-charcoal">
                    {formatDate(currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {isFirstPlan && plan === 'free' && (
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-secondary-800">Your First Plan is Free!</p>
                    <p className="text-sm text-secondary-600">
                      Create your first meal plan with full Pro features at no cost.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cancelAtPeriodEnd && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-800">
                  Your subscription will end on {formatDate(currentPeriodEnd)}.
                  You'll be downgraded to the Free plan after this date.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {plan === 'free' ? (
                <Link
                  to="/pricing"
                  className="btn-primary px-4 py-2"
                >
                  Upgrade to Pro
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleOpenPortal}
                    disabled={portalLoading}
                    className="px-4 py-2 bg-charcoal/5 text-charcoal rounded-xl font-medium hover:bg-charcoal/10 transition-colors disabled:opacity-50"
                  >
                    {portalLoading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                  {!cancelAtPeriodEnd && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 text-charcoal/60 hover:text-red-600 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Usage Card */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-display text-xl text-charcoal mb-4">This Month's Usage</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-charcoal/60 mb-1">Meal Plans Created</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-charcoal">
                    {plansCreatedThisMonth}
                  </span>
                  <span className="text-charcoal/50">
                    / {plansLimit === 'unlimited' ? '∞' : plansLimit}
                  </span>
                </div>
                {typeof plansLimit === 'number' && (
                  <div className="mt-2 h-2 bg-charcoal/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usagePercentage >= 100 ? 'bg-red-500' : 'bg-secondary-500'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-charcoal/60 mb-1">Max Plan Duration</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-charcoal">
                    {maxDays}
                  </span>
                  <span className="text-charcoal/50">days</span>
                </div>
              </div>
            </div>

            {usageMessage && (
              <p className="mt-4 text-sm text-charcoal/60">{usageMessage}</p>
            )}

            {!canCreatePlan && plan === 'free' && (
              <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-4">
                <p className="text-sm text-primary-800">
                  You've reached your monthly limit.{' '}
                  <Link to="/pricing" className="font-medium underline">
                    Upgrade to Pro
                  </Link>{' '}
                  for unlimited plans or{' '}
                  <Link to="/pricing" className="font-medium underline">
                    purchase a single plan
                  </Link>{' '}
                  for $2.99.
                </p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-display text-xl text-charcoal mb-4">Payment History</h2>

            {paymentsLoading ? (
              <div className="py-8 text-center text-charcoal/40">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center text-charcoal/40">
                No payments yet
              </div>
            ) : (
              <div className="divide-y divide-charcoal/10">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-charcoal">
                        {payment.description || 'Food Minded Pro'}
                      </p>
                      <p className="text-sm text-charcoal/50">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-charcoal">
                        {formatCurrency(payment.amount_paid, payment.currency)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs ${
                            payment.status === 'paid'
                              ? 'text-secondary-600'
                              : 'text-charcoal/50'
                          }`}
                        >
                          {payment.status}
                        </span>
                        {payment.invoice_url && (
                          <a
                            href={payment.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-500 hover:underline"
                          >
                            Invoice
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-display text-xl text-charcoal mb-4">Your Features</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <FeatureItem
                label="Meal plans per month"
                value={plan === 'pro' ? 'Unlimited' : '1'}
                available={true}
              />
              <FeatureItem
                label="Max plan duration"
                value={`${maxDays} days`}
                available={true}
              />
              <FeatureItem
                label="All diet types"
                value="6 types"
                available={plan === 'pro' || isFirstPlan}
              />
              <FeatureItem
                label="Custom macros"
                value="Full control"
                available={plan === 'pro' || isFirstPlan}
              />
              <FeatureItem
                label="Plan regeneration"
                value="Unlimited"
                available={plan === 'pro'}
              />
              <FeatureItem
                label="PDF export"
                value="Grocery lists"
                available={plan === 'pro' || isFirstPlan}
              />
              <FeatureItem
                label="Smart pricing"
                value="Multi-store"
                available={plan === 'pro' || isFirstPlan}
              />
              <FeatureItem
                label="Priority support"
                value="Email support"
                available={plan === 'pro'}
              />
            </div>

            {plan === 'free' && !isFirstPlan && (
              <div className="mt-6 text-center">
                <Link to="/pricing" className="btn-primary px-6 py-2">
                  Unlock All Features
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-display text-xl text-charcoal mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-charcoal/60 mb-6">
              Your subscription will remain active until {formatDate(currentPeriodEnd)}.
              After that, you'll be downgraded to the Free plan with limited features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-charcoal/5 text-charcoal rounded-xl font-medium hover:bg-charcoal/10 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureItem({
  label,
  value,
  available,
}: {
  label: string
  value: string
  available: boolean
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-charcoal/5 rounded-xl">
      <span className="text-sm text-charcoal">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${available ? 'text-charcoal' : 'text-charcoal/40'}`}>
          {value}
        </span>
        {available ? (
          <svg
            className="w-4 h-4 text-secondary-500"
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
        ) : (
          <svg
            className="w-4 h-4 text-charcoal/30"
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
        )}
      </div>
    </div>
  )
}
