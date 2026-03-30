// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

// createContext creates a "channel" that any component
// can tune into to get the current user data
const AuthContext = createContext()

// AuthProvider wraps your whole app in App.jsx
// It holds the logged in user in state
// and shares it with every component below it
export function AuthProvider({ children }) {
  // user = the logged in user object, or null if not logged in
  const [user,    setUser]    = useState(null)

  // loading = true while we check if user is already logged in
  // (on page refresh we check localStorage for a saved token)
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────
  // ON APP LOAD — restore session
  // ─────────────────────────────────────
  // When user refreshes the page, React state resets
  // But the JWT token is still in localStorage
  // We use it to fetch the user's data again
  // So they stay logged in across refreshes
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
      
        setLoading(false)
        return
      }

      try {
     
        const res = await fetch('https://lumiere-u53g.onrender.com/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        if (data.success) {
          setUser(data.user)
        } else {
          // token is invalid or expired — clear it
          localStorage.removeItem('token')
        }
      } catch (err) {
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])


  const login = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // ─────────────────────────────────────
  // LOGOUT — called from Navbar
  // ─────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = { user, loading, login, logout }

  return (
    <AuthContext.Provider value={value}>

      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}