// Login.jsx
import { useState }      from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }       from '../context/AuthContext'
import './Auth.css'

function Login() {
  // form state — tracks what user types
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // UI state
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // call POST /api/auth/login
      const res = await fetch('https://lumiere-u53g.onrender.com/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message)
        return
      }

      // login() saves token + user to context
      login(data.user, data.token)

      // redirect to feed after login
      navigate('/feed')

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <span className="auth-label">✦ Welcome back</span>
          <h1 className="auth-title">Sign In</h1>
          <div className="auth-line" />
        </div>

        {/* Error message */}
        {error && <p className="auth-error">{error}</p>}

        {/* Form */}
        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-field-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        {/* Switch to signup */}
        <p className="auth-switch">
          No account?{' '}
          <Link to="/signup" className="auth-switch-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login