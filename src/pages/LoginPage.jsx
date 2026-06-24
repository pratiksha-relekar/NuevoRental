import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../backend/firebase/auth'
import GoogleAuthButton from '../components/GoogleAuthButton'
import '../styles/pageAnimations.css'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, isAuthenticated, authReady, pendingRedirect, consumeRedirect } = useAuth()
  const redirectTo = location.state?.from ?? '/dashboard'

  useEffect(() => {
    if (!authReady || !isAuthenticated) return

    const destination = pendingRedirect ? consumeRedirect() : redirectTo
    navigate(destination, { replace: true })
  }, [authReady, isAuthenticated, pendingRedirect, consumeRedirect, navigate, redirectTo])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const result = await login({ email, password })
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const sessionUser = await loginWithGoogle(redirectTo)
      if (!sessionUser) {
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section auth-page" aria-labelledby="login-heading">
      <div className="page-section-inner auth-page-inner">
        <div className="auth-card page-animate-item">
          <span className="page-eyebrow">Welcome Back</span>
          <h1 id="login-heading" className="page-title auth-title">
            Login to Nuevo Rental
          </h1>
          <p className="auth-lead">Access your rentals, orders, and account details.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <p className="auth-forgot">
              <Link to="/support">Forgot password?</Link>
            </p>

            <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <GoogleAuthButton onClick={handleGoogle} disabled={loading} />

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>

          <div className="auth-admin-access">
            <Link to="/admin/login" className="auth-btn auth-btn--admin">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
