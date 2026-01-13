import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'

// Mock checkout data
const MOCK_ORDER_SUMMARY = {
  items: 12,
  subtotal: 89.86,
  savings: 12.50,
  delivery: 0,
  total: 89.86,
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearPlan } = usePlanStore()
  const { logout } = useAuthStore()

  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')

  const handleCheckout = async () => {
    setProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCompleted(true)
    clearPlan()
    setProcessing(false)
  }

  const orderSummary = cart
    ? {
        items: cart.items?.length || MOCK_ORDER_SUMMARY.items,
        subtotal: cart.total || MOCK_ORDER_SUMMARY.subtotal,
        savings: MOCK_ORDER_SUMMARY.savings,
        delivery: deliveryOption === 'delivery' ? 4.99 : 0,
        total: (cart.total || MOCK_ORDER_SUMMARY.subtotal) + (deliveryOption === 'delivery' ? 4.99 : 0),
      }
    : MOCK_ORDER_SUMMARY

  if (completed) {
    return (
      <div className="min-h-screen bg-cream py-8 px-4">
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-charcoal mb-3">Order Confirmed!</h1>
          <p className="text-charcoal/60 mb-2">Your groceries are on their way.</p>
          <p className="text-sm text-charcoal/40 mb-8">
            Order #FM-{Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>

          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 text-left">
            <h3 className="font-medium text-charcoal mb-3">What's next?</h3>
            <ul className="space-y-3 text-sm text-charcoal/70">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-bold">1</span>
                You'll receive a confirmation email shortly
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-bold">2</span>
                {deliveryOption === 'delivery' ? 'Delivery arrives in 1-2 hours' : 'Pickup ready in 30 minutes'}
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

        <h1 className="font-display text-2xl text-charcoal mb-1">Checkout</h1>
        <p className="text-charcoal/60 text-sm mb-6">Choose delivery and confirm your order</p>

        {/* Delivery Options */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
          <h2 className="font-medium text-charcoal mb-4">Delivery Method</h2>
          <div className="space-y-3">
            <button
              onClick={() => setDeliveryOption('pickup')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                deliveryOption === 'pickup'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-charcoal/10 hover:border-charcoal/20'
              }`}
            >
              <span className="text-2xl">🏪</span>
              <div className="flex-1">
                <div className="font-medium text-charcoal">Store Pickup</div>
                <div className="text-sm text-charcoal/60">Ready in 30 minutes · Free</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                deliveryOption === 'pickup' ? 'border-primary-500 bg-primary-500' : 'border-charcoal/20'
              }`}>
                {deliveryOption === 'pickup' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            <button
              onClick={() => setDeliveryOption('delivery')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                deliveryOption === 'delivery'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-charcoal/10 hover:border-charcoal/20'
              }`}
            >
              <span className="text-2xl">🚗</span>
              <div className="flex-1">
                <div className="font-medium text-charcoal">Home Delivery</div>
                <div className="text-sm text-charcoal/60">1-2 hours · $4.99</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                deliveryOption === 'delivery' ? 'border-primary-500 bg-primary-500' : 'border-charcoal/20'
              }`}>
                {deliveryOption === 'delivery' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
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
              <span>Your savings</span>
              <span>-${orderSummary.savings.toFixed(2)}</span>
            </div>
            {orderSummary.delivery > 0 && (
              <div className="flex justify-between text-charcoal/70">
                <span>Delivery</span>
                <span>${orderSummary.delivery.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-charcoal/10 pt-3 mt-3 flex justify-between font-semibold text-charcoal text-lg">
              <span>Total</span>
              <span>${orderSummary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-medium text-accent-700 text-sm">Demo Mode</h3>
              <p className="text-xs text-accent-600 mt-1">
                This is a demonstration. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing Order...
            </span>
          ) : (
            `Place Order · $${orderSummary.total.toFixed(2)}`
          )}
        </button>

        <p className="text-center text-xs text-charcoal/40 mt-3">
          Secure checkout · 256-bit SSL encryption
        </p>
      </div>
    </div>
  )
}
