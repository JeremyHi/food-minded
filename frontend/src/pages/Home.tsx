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
              <span className="text-sm text-charcoal/60">{user?.email}</span>
              <Link to="/configure" className="btn-outline text-sm py-2 px-4">
                My Plan
              </Link>
              <button onClick={logout} className="text-sm text-charcoal/60 hover:text-primary-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-charcoal/60 hover:text-primary-500">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started Free
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-500 font-medium mb-4 tracking-wide">For busy moms who care about nutrition</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6 text-balance leading-tight">
            Nourish Your Family Without the Stress
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            You want the best nutrition for your kids and yourself, but meal planning feels overwhelming.
            We create personalized, allergy-safe meal plans and grocery lists that fit your real life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg py-4 px-8">
              Start Your Free Plan
            </Link>
            <Link to="/login" className="btn-outline text-lg py-4 px-8">
              I Have an Account
            </Link>
          </div>
          <p className="mt-6 text-sm text-charcoal/50">No credit card required. Set up in 2 minutes.</p>
        </div>

        {/* Social Proof */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <p className="text-charcoal/60 text-sm mb-4">Trusted by families everywhere</p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="card text-center group hover:shadow-medium transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2 text-charcoal">Family-Friendly Meals</h3>
            <p className="text-charcoal/60 leading-relaxed">
              Recipes the whole family will love. Kid-approved options with hidden veggies and balanced nutrition.
            </p>
          </div>

          <div className="card text-center group hover:shadow-medium transition-shadow duration-300">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2 text-charcoal">Allergy Safe</h3>
            <p className="text-charcoal/60 leading-relaxed">
              Set your family's allergies once and relax. We automatically filter every recipe and ingredient.
            </p>
          </div>

          <div className="card text-center group hover:shadow-medium transition-shadow duration-300">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2 text-charcoal">Save Hours Weekly</h3>
            <p className="text-charcoal/60 leading-relaxed">
              No more "what's for dinner?" stress. Consolidated grocery lists within your budget, ready to order.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-32">
          <h3 className="font-display text-3xl text-center text-charcoal mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <p className="font-medium text-charcoal mb-1">Set Preferences</p>
              <p className="text-sm text-charcoal/60">Diet goals, allergies, budget</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <p className="font-medium text-charcoal mb-1">Get Your Plan</p>
              <p className="text-sm text-charcoal/60">AI creates your meal plan</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <p className="font-medium text-charcoal mb-1">Review & Adjust</p>
              <p className="text-sm text-charcoal/60">Swap meals, edit portions</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mx-auto mb-4">4</div>
              <p className="font-medium text-charcoal mb-1">Shop & Cook</p>
              <p className="text-sm text-charcoal/60">One-click grocery ordering</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-32 text-center bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
          <h3 className="font-display text-3xl text-charcoal mb-4">Ready to simplify family meals?</h3>
          <p className="text-charcoal/70 mb-8">Join thousands of moms who've taken the stress out of dinner time.</p>
          <Link to="/register" className="btn-primary text-lg py-4 px-8 inline-block">
            Start Free Today
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 text-center border-t border-charcoal/10">
        <p className="text-charcoal/50 text-sm">Built with care for families who value good nutrition.</p>
        <p className="text-charcoal/40 text-xs mt-2">Food Minded &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
