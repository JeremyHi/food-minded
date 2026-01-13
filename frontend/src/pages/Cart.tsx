import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'
import type { Cart as CartType, CartItem } from '../types'

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem
  onUpdate: (quantity: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-500">{item.unit}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(Math.max(0, item.quantity - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            -
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdate(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            +
          </button>
        </div>
        <div className="w-20 text-right font-medium">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-600"
          aria-label="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const { cart: storedCart, setCart } = usePlanStore()
  const { logout } = useAuthStore()

  const [cart, setLocalCart] = useState<CartType | null>(storedCart)
  const [loading, setLoading] = useState(!storedCart)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (storedCart) {
      setLocalCart(storedCart)
      setLoading(false)
    } else {
      // No cart, redirect to plan
      navigate('/plan')
    }
  }, [storedCart, navigate])

  const handleUpdateItem = async (index: number, quantity: number) => {
    if (!cart) return

    const newItems = [...cart.items]
    if (quantity <= 0) {
      newItems.splice(index, 1)
    } else {
      newItems[index] = { ...newItems[index], quantity }
    }

    setUpdating(true)
    try {
      const updatedCart = await api.cart.update(cart.id, newItems)
      setLocalCart(updatedCart)
      setCart(updatedCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    handleUpdateItem(index, 0)
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading cart...</div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <h2 className="font-display text-2xl mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Generate a meal plan first to add items to your cart.</p>
          <Link to="/plan" className="btn-primary">
            View Meal Plan
          </Link>
        </div>
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
          <div className="flex items-center gap-4">
            <Link to="/plan" className="text-sm text-gray-600 hover:text-primary-500">
              Back to Plan
            </Link>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        <h1 className="font-display text-3xl mb-2">Your Cart</h1>
        <p className="text-gray-600 mb-8">Review and edit your grocery list before checkout.</p>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3 mb-8">
          {cart.items.map((item, idx) => (
            <CartItemRow
              key={item.product_id}
              item={item}
              onUpdate={(qty) => handleUpdateItem(idx, qty)}
              onRemove={() => handleRemoveItem(idx)}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-display">${cart.total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={updating}
            className="btn-primary w-full text-lg py-4"
          >
            Proceed to Checkout
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            This is a demo checkout. No real payment will be processed.
          </p>
        </div>
      </div>
    </div>
  )
}
