import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="font-display text-2xl text-primary-500">Food Minded</h1>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Link to="/configure" className="btn-outline text-sm py-2 px-4">
                Dashboard
              </Link>
              <button onClick={logout} className="text-sm text-gray-600 hover:text-primary-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-primary-500">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-6 text-balance">
            Meal Planning That Actually Works
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Tell us your diet goals, allergies, and budget. We'll create a personalized meal plan
            and shopping list that makes healthy eating effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg py-4 px-8">
              Start Your Plan
            </Link>
            <Link to="/login" className="btn-outline text-lg py-4 px-8">
              I Have an Account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2">Custom Diet Plans</h3>
            <p className="text-gray-600">
              Support for 40/30/30 Zone, Keto, High Protein, and more. Set your exact macro targets.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2">Allergy Safe</h3>
            <p className="text-gray-600">
              Declare your allergies once and never worry about them again. We filter everything.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2">Smart Shopping</h3>
            <p className="text-gray-600">
              Consolidated grocery lists within your budget. Review, edit, and order in one click.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 text-sm">
        <p>Built with care for your health journey.</p>
      </footer>
    </div>
  )
}
