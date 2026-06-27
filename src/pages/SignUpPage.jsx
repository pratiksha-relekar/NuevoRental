import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../backend/firebase/auth'
import GoogleAuthButton from '../components/GoogleAuthButton'
import AuthShell from '../components/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
const SIGNUP_FEATURES = [
  'Create an account in under two minutes',
  'Browse 100+ devices ready to rent',
  'Corporate billing & KYC support built in',
]

function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, loginWithGoogle, isAuthenticated, authReady, pendingRedirect, consumeRedirect } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authReady || !isAuthenticated) return

    const destination = pendingRedirect ? consumeRedirect() : '/dashboard'
    navigate(destination, { replace: true })
  }, [authReady, isAuthenticated, pendingRedirect, consumeRedirect, navigate])

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
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

    setLoading(true)
    try {
      const result = await signUp({ firstName, lastName, email, password })
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate('/dashboard', { replace: true })
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
      const sessionUser = await loginWithGoogle('/dashboard')
      if (!sessionUser) {
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      ariaLabelledBy="signup-heading"
      brandEyebrow="Get Started"
      brandTitle="Join thousands renting IT equipment"
      brandLead="Create your account and unlock flexible rental plans for laptops, desktops, printers, and more — delivered to your door."
      features={SIGNUP_FEATURES}
      mobileTagline="Create your account"
    >
      <header className="auth-card-header">
        <span className="page-eyebrow auth-card-eyebrow">New Account</span>
        <h1 id="signup-heading" className="page-title auth-title">
          Create Your Account
        </h1>
        <p className="auth-lead">Join Nuevo Rental and start renting tech in minutes.</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field-group">
          <div className="auth-field-row">
            <div className="auth-field">
              <Label htmlFor="signup-firstName">
                <span>First Name</span>
              </Label>
              <Input
                id="signup-firstName"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={updateField('firstName')}
                placeholder="First name"
                autoComplete="given-name"
                disabled={loading}
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="signup-lastName">
                <span>Last Name</span>
              </Label>
              <Input
                id="signup-lastName"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={updateField('lastName')}
                placeholder="Last name"
                autoComplete="family-name"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="auth-field">
          <Label htmlFor="signup-email">
            <span>Email</span>
          </Label>
          <Input
            id="signup-email"
            type="email"
            name="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="you@company.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="auth-field">
          <Label htmlFor="signup-password">
            <span>Password</span>
          </Label>
          <Input
            id="signup-password"
            type="password"
            name="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div className="auth-field">
          <Label htmlFor="signup-confirmPassword">
            <span>Confirm Password</span>
          </Label>
          <Input
            id="signup-confirmPassword"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <Button type="submit" variant="default" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <GoogleAuthButton onClick={handleGoogle} disabled={loading} />

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthShell>
  )
}

export default SignUpPage
