import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import '../styles/pageAnimations.css'
import './AuthPage.css'

function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, loginWithGoogle, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    const { firstName, lastName, email, password, confirmPassword } = form

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    signUp({ firstName, lastName, email, password })
    navigate('/dashboard')
  }

  const handleGoogle = () => {
    loginWithGoogle()
    navigate('/dashboard')
  }

  return (
    <section className="page-section auth-page" aria-labelledby="signup-heading">
      <div className="page-section-inner auth-page-inner">
        <div className="auth-card page-animate-item">
          <span className="page-eyebrow">Get Started</span>
          <h1 id="signup-heading" className="page-title auth-title">
            Create Your Account
          </h1>
          <p className="auth-lead">Join Nuevo Rental and start renting tech in minutes.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field-group">
              <div className="auth-field-row">
                <label className="auth-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={updateField('firstName')}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </label>
                <label className="auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={updateField('lastName')}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </label>
              </div>
            </div>

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField('password')}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </label>

            <label className="auth-field">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="auth-btn auth-btn--primary">
              Sign Up
            </button>
          </form>

          <div className="auth-divider">or</div>

          <GoogleAuthButton onClick={handleGoogle} />

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default SignUpPage
