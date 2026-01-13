import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearPlan } = usePlanStore()
  const { logout } = useAuthStore()

  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!cart) return

    setProcessing(true)
    setError('')

    try {
      const order = await api.cart.checkout(cart.id)
      setOrderId(order.id)
      setCompleted(true)
      clearPlan()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setProcessing(false)
    }
  }

  if (!cart && !completed) {
    navigate('/cart')
    return null
  }

  if (completed) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-2">Your order #{orderId} has been placed successfully.</p>
          <p className="text-sm text-gray-500 mb-8">
            This is a demo checkout. No real order was placed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/configure" className="btn-primary">
              Create Another Plan
            </Link>
            <Link to="/" className="btn-outline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display text-2xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="text-sm text-gray-600 hover:text-primary-500">
              Back to Cart
            </Link>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        <h1 className="font-display text-3xl mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Review your order and confirm.</p>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="card mb-6">
          <h2 className="font-display text-xl mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart?.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-xl">${cart?.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="card bg-yellow-50 border border-yellow-200 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This is a mock checkout for demonstration purposes. No real payment will be processed
                and no actual order will be placed.
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={processing}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Confirm Order'
          )}
        </button>
      </div>
    </div>
  )
}
