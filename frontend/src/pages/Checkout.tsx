import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'

// Mock retailer data for multi-store cart
const MOCK_RETAILERS = [
  { name: 'Whole Foods', items: 5, subtotal: 42.95, logo: '🥬' },
  { name: 'Kroger', items: 4, subtotal: 28.46, logo: '🛒' },
  { name: 'Costco', items: 3, subtotal: 18.45, logo: '📦' },
]

const MOCK_ORDER_SUMMARY = {
  items: 12,
  subtotal: 89.86,
  savings: 12.50,
  serviceFee: 2.99,
  deliveryFee: 5.99,
  total: 86.34,
}

type CheckoutStep = 'review' | 'finding' | 'confirm' | 'complete'

export default function Checkout() {
  const { cart, clearPlan } = usePlanStore()
  const { logout } = useAuthStore()

  const [step, setStep] = useState<CheckoutStep>('review')
  const [selectedRetailers, setSelectedRetailers] = useState<typeof MOCK_RETAILERS>(MOCK_RETAILERS)

  const orderSummary = cart
    ? {
        items: cart.items?.length || MOCK_ORDER_SUMMARY.items,
        subtotal: cart.total || MOCK_ORDER_SUMMARY.subtotal,
        savings: MOCK_ORDER_SUMMARY.savings,
        serviceFee: MOCK_ORDER_SUMMARY.serviceFee,
        deliveryFee: MOCK_ORDER_SUMMARY.deliveryFee,
        total: (cart.total || MOCK_ORDER_SUMMARY.subtotal) - MOCK_ORDER_SUMMARY.savings + MOCK_ORDER_SUMMARY.serviceFee + MOCK_ORDER_SUMMARY.deliveryFee,
      }
    : MOCK_ORDER_SUMMARY

  const handleFindBestPrices = async () => {
    setStep('finding')
    // Simulate API call to commerce protocols (UCP/ACP)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setStep('confirm')
  }

  const handlePlaceOrders = async () => {
    setStep('finding')
    // Simulate placing orders with multiple retailers
    await new Promise(resolve => setTimeout(resolve, 2000))
    clearPlan()
    setStep('complete')
  }

  // Order Complete Screen
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-cream py-8 px-4">
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-charcoal mb-3">Orders Placed!</h1>
          <p className="text-charcoal/60 mb-2">Your groceries are being prepared across {selectedRetailers.length} stores.</p>
          <p className="text-sm text-charcoal/40 mb-8">
            Order Group #FM-{Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>

          {/* Retailer Order Confirmations */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-6 text-left">
            <h3 className="font-medium text-charcoal mb-4">Your Orders</h3>
            <div className="space-y-3">
              {selectedRetailers.map((retailer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-charcoal/5 rounded-xl">
                  <span className="text-2xl">{retailer.logo}</span>
                  <div className="flex-1">
                    <div className="font-medium text-charcoal text-sm">{retailer.name}</div>
                    <div className="text-xs text-charcoal/60">{retailer.items} items · Delivery 1-2 hrs</div>
                  </div>
                  <div className="text-sm font-semibold text-primary-600">${retailer.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 text-left">
            <h3 className="font-medium text-charcoal mb-3">What's next?</h3>
            <ul className="space-y-3 text-sm text-charcoal/70">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-bold">1</span>
                You'll receive confirmation emails from each retailer
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-bold">2</span>
                Track each delivery in real-time via retailer apps
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-bold">3</span>
                Start cooking your healthy meals!
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/configure" className="btn-primary py-3">
              Plan Next Week's Meals
            </Link>
            <Link to="/" className="text-charcoal/60 hover:text-primary-500 text-sm">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Finding Best Prices Screen
  if (step === 'finding') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="font-display text-2xl text-charcoal mb-2">Finding Best Prices</h2>
          <p className="text-charcoal/60 mb-6">
            Searching partner retailers for the best deals on your grocery list...
          </p>
          <div className="flex justify-center gap-4 text-3xl">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🥬</span>
            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🛒</span>
            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>📦</span>
          </div>
        </div>
      </div>
    )
  }

  // Confirm Multi-Store Cart Screen
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-cream py-6 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="font-display text-xl text-primary-500">
              Food Minded
            </Link>
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('review')} className="text-sm text-charcoal/60 hover:text-primary-500">
                ← Back
              </button>
              <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
                Logout
              </button>
            </div>
          </div>

          <h1 className="font-display text-2xl text-charcoal mb-1">Smart Cart Ready</h1>
          <p className="text-charcoal/60 text-sm mb-6">We found the best prices across {selectedRetailers.length} stores</p>

          {/* Savings Banner */}
          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl p-4 mb-4 text-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <div className="font-semibold">You're saving ${orderSummary.savings.toFixed(2)}!</div>
                <div className="text-sm text-white/80">By shopping smart across multiple stores</div>
              </div>
            </div>
          </div>

          {/* Retailer Breakdown */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <h2 className="font-medium text-charcoal mb-4">Your Smart Cart</h2>
            <div className="space-y-3">
              {selectedRetailers.map((retailer, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-charcoal/10 rounded-xl">
                  <span className="text-3xl">{retailer.logo}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-charcoal">{retailer.name}</div>
                    <div className="text-sm text-charcoal/60">{retailer.items} items</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-charcoal">${retailer.subtotal.toFixed(2)}</div>
                    <div className="text-xs text-charcoal/50">Delivery included</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <h2 className="font-medium text-charcoal mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <span>{orderSummary.items} items</span>
                <span>${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Multi-store savings</span>
                <span>-${orderSummary.savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>Service fee</span>
                <span>${orderSummary.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>Delivery (all stores)</span>
                <span>${orderSummary.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-charcoal/10 pt-3 mt-3 flex justify-between font-semibold text-charcoal text-lg">
                <span>Total</span>
                <span>${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <span className="text-xl">🚚</span>
              <div>
                <h3 className="font-medium text-primary-700 text-sm">Coordinated Delivery</h3>
                <p className="text-xs text-primary-600 mt-1">
                  Each retailer will deliver directly to you. Expect all items within 1-2 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Place Orders Button */}
          <button
            onClick={handlePlaceOrders}
            className="w-full btn-primary py-4 text-lg"
          >
            Place Orders · ${orderSummary.total.toFixed(2)}
          </button>

          <p className="text-center text-xs text-charcoal/40 mt-3">
            Secure checkout via partner retailers
          </p>
        </div>
      </div>
    )
  }

  // Initial Review Screen
  return (
    <div className="min-h-screen bg-cream py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="font-display text-xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="text-sm text-charcoal/60 hover:text-primary-500">
              ← Back
            </Link>
            <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        <h1 className="font-display text-2xl text-charcoal mb-1">Smart Checkout</h1>
        <p className="text-charcoal/60 text-sm mb-6">We'll find the best prices across partner stores</p>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
          <h2 className="font-medium text-charcoal mb-4">How Smart Shopping Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <div className="font-medium text-charcoal text-sm">We search partner retailers</div>
                <div className="text-xs text-charcoal/60">Including Whole Foods, Kroger, Costco & more</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <div className="font-medium text-charcoal text-sm">We find the best prices</div>
                <div className="text-xs text-charcoal/60">Split your list across stores for maximum savings</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <div className="font-medium text-charcoal text-sm">Coordinated delivery</div>
                <div className="text-xs text-charcoal/60">All items delivered to your door in 1-2 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Grocery List */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-charcoal">Your Grocery List</h2>
            <span className="text-sm text-charcoal/60">{orderSummary.items} items</span>
          </div>
          <div className="text-center py-4 text-charcoal/50 text-sm">
            Estimated total: <span className="font-semibold text-charcoal">${orderSummary.subtotal.toFixed(2)}</span>
            <div className="text-xs mt-1">Final prices determined after store search</div>
          </div>
        </div>

        {/* Partner Stores */}
        <div className="bg-charcoal/5 rounded-xl p-4 mb-6">
          <div className="text-xs text-charcoal/60 mb-2 text-center">Partner Retailers</div>
          <div className="flex justify-center gap-6 text-2xl">
            <span title="Whole Foods">🥬</span>
            <span title="Kroger">🛒</span>
            <span title="Costco">📦</span>
            <span title="Target">🎯</span>
            <span title="Walmart">🏪</span>
          </div>
        </div>

        {/* Find Best Prices Button */}
        <button
          onClick={handleFindBestPrices}
          className="w-full btn-primary py-4 text-lg"
        >
          Find Best Prices
        </button>

        <p className="text-center text-xs text-charcoal/40 mt-3">
          Powered by Google UCP & OpenAI ACP
        </p>
      </div>
    </div>
  )
}
