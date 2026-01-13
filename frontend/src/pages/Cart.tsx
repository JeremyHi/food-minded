import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePlanStore } from '../store/planStore'
import { useAuthStore } from '../store/authStore'

// Mock cart data for demo
const MOCK_CART = {
  id: 'demo-cart-001',
  items: [
    { id: '1', name: 'Chicken Breast (2 lbs)', quantity: 1, price: 12.99, category: 'Protein', checked: true },
    { id: '2', name: 'Salmon Fillet (1 lb)', quantity: 1, price: 14.99, category: 'Protein', checked: true },
    { id: '3', name: 'Greek Yogurt (32oz)', quantity: 1, price: 5.99, category: 'Dairy', checked: true },
    { id: '4', name: 'Mixed Berries (frozen)', quantity: 1, price: 4.99, category: 'Produce', checked: true },
    { id: '5', name: 'Quinoa (1 lb bag)', quantity: 1, price: 6.99, category: 'Grains', checked: true },
    { id: '6', name: 'Brown Rice (2 lb bag)', quantity: 1, price: 4.49, category: 'Grains', checked: true },
    { id: '7', name: 'Mixed Greens (5oz)', quantity: 2, price: 4.99, category: 'Produce', checked: true },
    { id: '8', name: 'Sweet Potatoes (3 lb)', quantity: 1, price: 3.99, category: 'Produce', checked: true },
    { id: '9', name: 'Avocados (4 pack)', quantity: 1, price: 5.99, category: 'Produce', checked: true },
    { id: '10', name: 'Eggs (dozen)', quantity: 1, price: 4.99, category: 'Dairy', checked: true },
    { id: '11', name: 'Almond Butter (16oz)', quantity: 1, price: 8.99, category: 'Pantry', checked: true },
    { id: '12', name: 'Hummus (10oz)', quantity: 1, price: 4.49, category: 'Deli', checked: true },
  ],
  total: 89.86,
}

const categoryIcons: Record<string, string> = {
  Protein: '🥩',
  Dairy: '🥛',
  Produce: '🥬',
  Grains: '🌾',
  Pantry: '🫙',
  Deli: '🥗',
}

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
  checked: boolean
}

function CartItemRow({
  item,
  onToggle,
  onUpdate,
}: {
  item: CartItem
  onToggle: () => void
  onUpdate: (quantity: number) => void
}) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl transition-all ${!item.checked ? 'opacity-50' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          item.checked
            ? 'bg-secondary-500 border-secondary-500 text-white'
            : 'border-charcoal/20 hover:border-secondary-400'
        }`}
      >
        {item.checked && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className="text-xl">{categoryIcons[item.category] || '📦'}</span>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-charcoal ${!item.checked ? 'line-through' : ''}`}>{item.name}</h4>
        <p className="text-xs text-charcoal/50">{item.category}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(Math.max(1, item.quantity - 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/70"
        >
          -
        </button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdate(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/70"
        >
          +
        </button>
      </div>

      <div className="w-20 text-right font-semibold text-charcoal">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const { cart: storedCart } = usePlanStore()
  const { logout } = useAuthStore()

  const [items, setItems] = useState<CartItem[]>(MOCK_CART.items)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use stored cart if available, otherwise use mock
    if (storedCart?.items) {
      setItems(storedCart.items.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `item-${idx}`,
        category: item.category || 'Pantry',
        checked: item.checked !== false,
      })))
    }
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [storedCart])

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const checkedItems = items.filter(item => item.checked)
  const total = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-charcoal/60">Loading your cart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="font-display text-xl text-primary-500">
            Food Minded
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/plan" className="text-sm text-charcoal/60 hover:text-primary-500">
              ← Back to Plan
            </Link>
            <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
              Logout
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl text-charcoal mb-1">Your Grocery List</h1>
          <p className="text-charcoal/60 text-sm">
            {checkedItems.length} of {items.length} items · We'll find the best prices across stores
          </p>
        </div>

        {/* Cart Items */}
        <div className="space-y-2 mb-6">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id)}
              onUpdate={(qty) => updateQuantity(item.id, qty)}
            />
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-soft p-5 sticky bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-charcoal/60">{checkedItems.length} items</div>
              <div className="text-2xl font-display text-charcoal">${total.toFixed(2)}</div>
              <div className="text-xs text-charcoal/40">Estimated · Final prices may vary</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-charcoal/50">Avg. savings</div>
              <div className="text-sm text-secondary-600 font-medium">~$12-15 with smart shopping</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-primary py-4 text-lg"
          >
            Find Best Prices →
          </button>

          <p className="text-center text-xs text-charcoal/40 mt-3">
            We'll search Whole Foods, Kroger, Costco & more
          </p>
        </div>
      </div>
    </div>
  )
}
