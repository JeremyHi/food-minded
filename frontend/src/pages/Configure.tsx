import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ConfigureWizard from '../components/ConfigureWizard'

export default function Configure() {
  const { logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <Link to="/" className="font-display text-xl text-primary-500">
          Food Minded
        </Link>
        <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
          Logout
        </button>
      </header>

      <ConfigureWizard />
    </div>
  )
}
