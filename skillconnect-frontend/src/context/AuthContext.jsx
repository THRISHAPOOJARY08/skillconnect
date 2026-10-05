import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('skillconnect_token'))
  const [loading, setLoading] = useState(true)

  // On mount: verify the stored token is still valid by hitting /users/me
  useEffect(() => {
    const storedToken = localStorage.getItem('skillconnect_token')
    const storedUser  = localStorage.getItem('skillconnect_user')

    if (!storedToken) { setLoading(false); return }

    // Optimistically restore user for instant UI, then verify with backend
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch { /* ignore */ }
    }

    apiClient.get('/users/me')
      .then(r => {
        // Refresh stored user data with latest from server
        setUser(r.data)
        localStorage.setItem('skillconnect_user', JSON.stringify(r.data))
      })
      .catch(() => {
        // Token expired or invalid — clear everything
        localStorage.removeItem('skillconnect_token')
        localStorage.removeItem('skillconnect_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, jwtToken) => {
    setToken(jwtToken)
    setUser(userData)
    localStorage.setItem('skillconnect_token', jwtToken)
    localStorage.setItem('skillconnect_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('skillconnect_token')
    localStorage.removeItem('skillconnect_user')
  }

  const updateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('skillconnect_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
