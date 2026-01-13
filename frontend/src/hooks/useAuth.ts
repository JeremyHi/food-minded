import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'

/**
 * Hook to manage authentication state and actions
 */
export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()

  // Verify token on mount
  useEffect(() => {
    async function verifyAuth() {
      if (token && !user) {
        try {
          const userData = await api.auth.me()
          setAuth(userData, token)
        } catch {
          storeLogout()
        }
      }
    }
    verifyAuth()
  }, [token, user, setAuth, storeLogout])

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password)
    setAuth(response.user, response.token.access_token)
    return response.user
  }

  const register = async (email: string, password: string) => {
    const response = await api.auth.register(email, password)
    setAuth(response.user, response.token.access_token)
    return response.user
  }

  const logout = () => {
    storeLogout()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
