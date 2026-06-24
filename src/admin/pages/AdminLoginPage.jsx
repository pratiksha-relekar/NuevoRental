import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import '../../styles/pageAnimations.css'
import './AdminAuthPage.css'

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 4v6c0 4.5-3.2 8.2-7 9-3.8-.8-7-4.5-7-9V7l7-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isAdminAuthenticated } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAdminAuthenticated, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter your admin username and password.')
      return
    }

    const result = await login({ username, password })
    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <section className="admin-auth-page" aria-labelledby="admin-login-heading">
      <div className="admin-auth-shell">
        <div className="admin-auth-brand">
          <span className="admin-auth-brand-icon" aria-hidden="true">
            <ShieldIcon />
          </span>
          <h1>Nuevo Rental</h1>
          <p>Admin Control Panel</p>
        </div>

        <div className="admin-auth-card page-animate-item">
          <span className="admin-auth-eyebrow">Secure Access</span>
          <h2 id="admin-login-heading" className="admin-auth-title">Admin Login</h2>
          <p className="admin-auth-lead">
            Sign in to manage products, users, orders, and website content.
          </p>

          <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
            <label className="admin-auth-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
              />
            </label>

            <label className="admin-auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </label>

            {error && <p className="admin-auth-error" role="alert">{error}</p>}

            <button type="submit" className="admin-auth-btn admin-auth-btn--primary">
              Sign in to Admin
            </button>
          </form>

          <p className="admin-auth-hint">
            Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
          </p>

          <Link to="/login" className="admin-auth-back">
            ← Back to customer login
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AdminLoginPage
