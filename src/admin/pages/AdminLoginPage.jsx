import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import BrandLogo from '../../components/BrandLogo'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
const ADMIN_FEATURES = [
  'Manage products, categories & weekly offers',
  'Review orders, KYC & support requests',
  'Control users, invoices & site content',
]

function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isAdminAuthenticated } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.classList.add('auth-standalone-open')
    return () => {
      document.body.classList.remove('auth-standalone-open')
    }
  }, [])

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#ececec] p-4 max-[820px]:items-start max-[820px]:pt-[52px]"
      aria-labelledby="admin-login-heading"
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

      <div
        className={cn(
          'page-animate-item grid w-full max-w-[1080px] max-h-[calc(100svh-32px)] overflow-hidden border border-[#d8d8d8] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.1)]',
          'grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]',
          'max-[820px]:max-h-[calc(100svh-64px)] max-[820px]:max-w-[440px] max-[820px]:grid-cols-1 max-[820px]:grid-rows-[auto_1fr]',
        )}
      >
        <aside
          className="relative overflow-hidden bg-[#1a1a1a] text-white"
          aria-label="Admin control panel"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.04)_0%,transparent_45%),linear-gradient(0deg,rgba(0,0,0,0.5)_0%,transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative z-[1] flex h-full flex-col p-9 max-[820px]:p-[22px] [&_.brand-logo--admin-auth]:mb-3 [&_.brand-logo--admin-auth]:h-16 [&_.brand-logo--admin-auth]:max-w-[240px] [&_.brand-logo--admin-auth]:brightness-0 [&_.brand-logo--admin-auth]:invert max-[820px]:[&_.brand-logo--admin-auth]:mb-3.5 max-[820px]:[&_.brand-logo--admin-auth]:h-12">
            <BrandLogo variant="admin-auth" to="/" />
            <Badge
              variant="outline"
              className="mt-5 mb-3 w-fit rounded-none border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-[1.2px] text-white uppercase"
            >
              Admin Portal
            </Badge>
            <h1 className="mb-3 text-[clamp(26px,3vw,34px)] leading-tight font-bold tracking-[-0.3px]">
              Control Panel
            </h1>
            <p className="mb-6 max-w-[36ch] text-sm leading-relaxed text-white/70 max-[820px]:mb-4 max-[820px]:text-[13px]">
              Secure access to manage your rental platform, catalog, and customer operations.
            </p>
            <ul className="mt-auto flex flex-col gap-3 p-0 max-[820px]:mt-0 max-[820px]:gap-2">
              {ADMIN_FEATURES.map((item) => (
                <li
                  key={item}
                  className="relative pl-5 text-[13px] leading-snug text-white/90 before:absolute before:top-[7px] before:left-0 before:size-2 before:bg-white max-[820px]:text-xs"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex items-center justify-center overflow-y-auto p-8 max-[820px]:px-5 max-[820px]:py-6">
          <Card className="w-full max-w-[400px] gap-0 rounded-none border-0 bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="gap-2 px-0">
              <Badge
                variant="outline"
                className="w-fit rounded-none border-[#ddd] bg-[#f0f0f0] px-2.5 py-1 text-[10px] font-semibold tracking-[1.2px] text-[#1a1a1a] uppercase"
              >
                Secure Access
              </Badge>
              <CardTitle
                id="admin-login-heading"
                className="text-[clamp(22px,3vw,28px)] font-bold text-[#1a1a1a]"
              >
                Admin Login
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-[#666]">
                Sign in to manage products, users, orders, and website content.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
                <div className="mb-4 flex flex-col gap-2">
                  <Label className="text-[11px] font-semibold tracking-wide text-[#444] uppercase">
                    Username
                  </Label>
                  <Input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    className="h-[46px] rounded-none border-[#ddd] bg-[#fafafa] px-3.5 text-sm text-[#1a1a1a] placeholder:text-[#aaa] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8 max-[820px]:h-[50px] max-[820px]:text-base"
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
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="h-[46px] rounded-none border-[#ddd] bg-[#fafafa] px-3.5 text-sm text-[#1a1a1a] placeholder:text-[#aaa] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8 max-[820px]:h-[50px] max-[820px]:text-base"
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

                <Button
                  type="submit"
                  className="h-12 w-full rounded-none bg-[#1a1a1a] text-[13px] font-semibold tracking-wide text-white uppercase shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:bg-[#333]"
                >
                  Sign in to Admin
                </Button>
              </form>

              <p className="mt-4 border border-[#e8e8e8] bg-[#f7f7f7] px-3 py-2.5 text-center text-xs leading-snug text-[#666]">
                Demo credentials: <strong className="text-[#1a1a1a]">admin</strong> /{' '}
                <strong className="text-[#1a1a1a]">admin123</strong>
              </p>

              <Link
                to="/login"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'mt-4 h-[42px] w-full rounded-none border-[1.5px] border-[#1a1a1a] bg-white text-[13px] font-semibold normal-case tracking-normal text-[#1a1a1a] shadow-none hover:bg-[#1a1a1a] hover:text-white',
                )}
              >
                ← Customer Login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
