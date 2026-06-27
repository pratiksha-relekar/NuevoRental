import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../backend/firebase/auth'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, isAuthenticated, authReady, pendingRedirect, consumeRedirect } = useAuth()
  const redirectTo = location.state?.from ?? '/dashboard'

  useEffect(() => {
    document.body.classList.add('auth-standalone-open')
    return () => {
      document.body.classList.remove('auth-standalone-open')
    }
  }, [])

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#ececec] p-4 max-sm:items-start max-sm:pt-14"
      aria-labelledby="login-heading"
    >
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'fixed top-4 left-4 z-[110] h-auto rounded-none border-[#d0d0d0] bg-white px-3.5 py-2 text-xs font-semibold tracking-wide text-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#1a1a1a] hover:text-white',
        )}
      >
        ← Back to Home
      </Link>

      <Card
        className={cn(
          'page-animate-item w-full max-w-[420px] max-h-[calc(100svh-32px)] overflow-y-auto rounded-none border border-[#d8d8d8] border-t-4 border-t-[#1a1a1a] bg-white py-8 shadow-[0_20px_56px_rgba(0,0,0,0.1)] ring-0',
          'max-sm:max-h-[calc(100svh-68px)] max-sm:px-[18px] max-sm:py-6',
          'md:max-w-[440px] md:px-9 md:py-10',
        )}
      >
        <CardHeader className="gap-2 px-7 text-center max-sm:px-0 md:px-0">
          <Badge
            variant="outline"
            className="mx-auto rounded-none border-[#ddd] bg-[#f0f0f0] px-2.5 py-1 text-[10px] font-semibold tracking-[1.2px] text-[#1a1a1a] uppercase"
          >
            Welcome Back
          </Badge>
          <CardTitle
            id="login-heading"
            className="text-[clamp(22px,4vw,28px)] font-bold tracking-[-0.3px] text-[#1a1a1a]"
          >
            Login to Nuevo Rental
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-[#666]">
            Access your rentals, orders, and account details.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 max-sm:px-0 md:px-0">
          <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
            <div className="mb-4 flex flex-col gap-2">
              <Label className="text-[11px] font-semibold tracking-wide text-[#444] uppercase">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                disabled={loading}
                className="h-[50px] rounded-none border-[#ddd] bg-[#fafafa] px-3.5 text-base text-[#1a1a1a] placeholder:text-[#aaa] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8 md:h-[46px] md:text-sm"
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <Label className="text-[11px] font-semibold tracking-wide text-[#444] uppercase">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="h-[50px] rounded-none border-[#ddd] bg-[#fafafa] px-3.5 text-base text-[#1a1a1a] placeholder:text-[#aaa] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8 md:h-[46px] md:text-sm"
              />
            </div>

            {error && (
              <p
                className="mb-3.5 border border-[#f5c6c6] bg-[#fdf2f2] px-3 py-2.5 text-xs leading-snug font-medium text-[#c0392b]"
                role="alert"
              >
                {error}
              </p>
            )}

            <p className="-mt-1 mb-5 text-right">
              <Link
                to="/support"
                className="text-xs font-semibold text-[#1a1a1a] underline underline-offset-[3px]"
              >
                Forgot password?
              </Link>
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="h-[50px] w-full rounded-none bg-[#1a1a1a] text-[13px] font-semibold tracking-wide text-white uppercase shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:bg-[#333] md:h-12"
            >
              {loading ? 'Logging in…' : 'Login'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3.5">
            <Separator className="flex-1 bg-[#e8e8e8]" />
            <span className="text-[11px] font-semibold tracking-wide text-[#999] uppercase">or</span>
            <Separator className="flex-1 bg-[#e8e8e8]" />
          </div>

          <GoogleAuthButton onClick={handleGoogle} disabled={loading} />

          <p className="mt-5 text-center text-sm text-[#666]">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#1a1a1a] underline underline-offset-[3px]"
            >
              Sign up
            </Link>
          </p>

          <div className="mt-5 border-t border-[#ebebeb] pt-5">
            <Link
              to="/admin/login"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-[42px] w-full rounded-none border-[1.5px] border-[#1a1a1a] bg-white text-[11px] font-semibold tracking-wide text-[#1a1a1a] uppercase shadow-none hover:bg-[#1a1a1a] hover:text-white',
              )}
            >
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
