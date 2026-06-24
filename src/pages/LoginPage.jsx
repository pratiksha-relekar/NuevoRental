import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { getFirebaseAuthErrorMessage } from '../backend/firebase/authErrors'
import '../styles/pageAnimations.css'
import './AuthPage.css'

const GOOGLE_AUTH_ERROR_KEY = 'nuevo-rental-google-auth-error'

function readStoredGoogleAuthError() {
  try {
    const raw = window.localStorage.getItem(GOOGLE_AUTH_ERROR_KEY)
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return typeof parsed === 'string' ? parsed : ''
  } catch {
    return ''
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, isAuthenticated, authReady } = useAuth()
  const redirectTo = location.state?.from ?? '/dashboard'

  useEffect(() => {
    const storedError = readStoredGoogleAuthError()
    if (storedError) {
      setError(storedError)
      window.localStorage.removeItem(GOOGLE_AUTH_ERROR_KEY)
    }
  }, [])

  useEffect(() => {
    if (authReady && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [authReady, isAuthenticated, navigate, redirectTo])

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
      navigate(redirectTo)
    } catch {
      setError('Unable to log in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await loginWithGoogle()
      if (result?.redirecting) {
        return
      }
      navigate(redirectTo)
    } catch (err) {
      setError(getFirebaseAuthErrorMessage(err))
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
