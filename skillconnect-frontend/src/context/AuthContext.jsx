import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('skillconnect_token'))
  const [loading, setLoading] = useState(true)

  // On mount, rehydrate user from stored token
  useEffect(() => {
    const stored = localStorage.getItem('skillconnect_user')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setLoading(false)
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
