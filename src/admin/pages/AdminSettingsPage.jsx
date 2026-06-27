import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  Calendar,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Pencil,
  Shield,
  User,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import BrandLogo from '../../components/BrandLogo'
import {
  DEFAULT_ADMIN_SETTINGS,
  formatAdminRole,
  formatAdminSessionTime,
  isUsingDefaultAdminPassword,
} from '../../data/adminStorage'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminOutlineButton,
  AdminPrimaryButton,
  AdminSectionTitle,
  AdminStatusBadge,
  adminInputClass,
} from '../components/admin-ui'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <Label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
      <span>{label}</span>
      <div className="relative">
        <Input
          type={visible ? 'text' : 'password'}
          className={cn(adminInputClass, 'pr-10')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-none text-[#666] hover:bg-transparent hover:text-[#1a1a1a]"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
    </Label>
  )
}

function AdminSettingsPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { admin, updateProfile, updatePassword, logout } = useAdminAuth()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState(admin?.displayName ?? '')
  const [email, setEmail] = useState(admin?.email ?? '')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordVersion, setPasswordVersion] = useState(0)

  const usingDefaultPassword = useMemo(
    () => isUsingDefaultAdminPassword(),
    [passwordMessage, passwordVersion],
  )
  const initials = useMemo(
    () =>
      (admin?.displayName ?? 'A')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'A',
    [admin?.displayName],
  )

  useEffect(() => {
    if (!admin || isEditingProfile) return
    setDisplayName(admin.displayName)
    setEmail(admin.email)
  }, [admin, isEditingProfile])

  if (!admin) return null

  const handleStartEdit = () => {
    setDisplayName(admin.displayName)
    setEmail(admin.email)
    setProfileMessage('')
    setProfileError('')
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setDisplayName(admin.displayName)
    setEmail(admin.email)
    setProfileError('')
    setIsEditingProfile(false)
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileMessage('')

    if (!displayName.trim()) {
      setProfileError('Display name is required.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setProfileError('Please enter a valid contact email.')
      return
    }

    updateProfile({ displayName: displayName.trim(), email: email.trim() })
    setIsEditingProfile(false)
    setProfileMessage('Profile updated successfully.')
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setIsSavingPassword(true)
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    const result = updatePassword({ currentPassword, newPassword })
    setIsSavingPassword(false)

    if (!result.ok) {
      setPasswordError(result.error)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMessage('Password updated successfully.')
    setPasswordVersion((current) => current + 1)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Settings"
        description="Manage your Nuevo Rental admin profile, security credentials, and active session."
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AdminPanel>
          <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <AdminSectionTitle className="normal-case">Admin profile</AdminSectionTitle>
              <p className="mt-1 text-sm text-[#666]">Your name and contact email used across the admin panel.</p>
            </div>
            {!isEditingProfile ? (
              <AdminOutlineButton className="gap-1.5" onClick={handleStartEdit}>
                <Pencil size={15} aria-hidden="true" />
                Edit profile
              </AdminOutlineButton>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#1a1a1a]">
                {initials}
              </span>
              <div>
                <strong className="block text-base text-[#1a1a1a]">{admin.displayName}</strong>
                <AdminStatusBadge tone="dark" className="mt-1 gap-1">
                  <Shield size={13} aria-hidden="true" />
                  {formatAdminRole(admin.role)}
                </AdminStatusBadge>
              </div>
            </div>
            <BrandLogo variant="settings" asLink={false} className="max-h-10 w-auto opacity-80" />
          </div>

          {profileMessage ? (
            <p className="border-b border-[#e5e5e5] px-4 py-3 text-sm text-[#1f6b3a]">{profileMessage}</p>
          ) : null}
          {profileError ? (
            <p className="border-b border-[#e5e5e5] px-4 py-3 text-sm text-[#a94442]">{profileError}</p>
          ) : null}

          {isEditingProfile ? (
            <form className="flex flex-col gap-4 p-4" onSubmit={handleSaveProfile}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <span className="inline-flex items-center gap-1.5">
                    <User size={14} aria-hidden="true" />
                    Display name
                  </span>
                  <Input
                    type="text"
                    className={adminInputClass}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Administrator"
                  />
                </Label>
                <Label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} aria-hidden="true" />
                    Contact email
                  </span>
                  <Input
                    type="email"
                    className={adminInputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nuevorental.com"
                  />
                </Label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AdminOutlineButton onClick={handleCancelEdit}>
                  Cancel
                </AdminOutlineButton>
                <AdminPrimaryButton type="submit">Save profile</AdminPrimaryButton>
              </div>
            </form>
          ) : (
            <dl className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <User size={14} aria-hidden="true" />
                  Username
                </dt>
                <dd className="mt-1 text-sm text-[#1a1a1a]">
                  <code className="rounded-none bg-[#fafafa] px-1.5 py-0.5 text-xs">{admin.username}</code>
                  <small className="mt-1 block text-xs text-[#888]">Username cannot be changed.</small>
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <User size={14} aria-hidden="true" />
                  Display name
                </dt>
                <dd className="mt-1 text-sm text-[#1a1a1a]">{admin.displayName}</dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <Mail size={14} aria-hidden="true" />
                  Contact email
                </dt>
                <dd className="mt-1 text-sm text-[#1a1a1a]">{admin.email}</dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                  <Shield size={14} aria-hidden="true" />
                  Role
                </dt>
                <dd className="mt-1 text-sm text-[#1a1a1a]">{formatAdminRole(admin.role)}</dd>
              </div>
            </dl>
          )}
        </AdminPanel>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AdminPanel>
          <div className="border-b border-[#e5e5e5] p-4">
            <AdminSectionTitle className="normal-case">Change password</AdminSectionTitle>
            <p className="mt-1 text-sm text-[#666]">
              Pick a new password — at least 6 characters and different from your current one.
            </p>
          </div>

          {usingDefaultPassword ? (
            <Alert className="mx-4 mt-4 rounded-none border-[#f0d9a8] bg-[#fff8ea] text-[#8a6200]">
              <Lock size={18} aria-hidden="true" />
              <AlertDescription>
                You&apos;re still using the default password (
                <code>{DEFAULT_ADMIN_SETTINGS.password}</code>). Change it now to secure the Nuevo Rental admin
                panel.
              </AlertDescription>
            </Alert>
          ) : null}

          {passwordMessage ? (
            <p className="border-b border-[#e5e5e5] px-4 py-3 text-sm text-[#1f6b3a]">{passwordMessage}</p>
          ) : null}
          {passwordError ? (
            <p className="border-b border-[#e5e5e5] px-4 py-3 text-sm text-[#a94442]">{passwordError}</p>
          ) : null}

          <form className="flex flex-col gap-4 p-4" onSubmit={handlePasswordSubmit}>
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter the new password"
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-end">
              <AdminPrimaryButton type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? 'Updating…' : 'Update password'}
              </AdminPrimaryButton>
            </div>
          </form>
        </AdminPanel>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AdminPanel>
          <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <AdminSectionTitle className="normal-case">Session</AdminSectionTitle>
              <p className="mt-1 text-sm text-[#666]">Current admin session details.</p>
            </div>
            <AdminOutlineButton
              className="gap-1.5 border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white"
              onClick={() => {
                logout()
                navigate('/admin/login', { replace: true })
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </AdminOutlineButton>
          </div>

          <dl className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                <Calendar size={14} aria-hidden="true" />
                Logged in since
              </dt>
              <dd className="mt-1 text-sm text-[#1a1a1a]">{formatAdminSessionTime(admin.loggedInAt)}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
                <User size={14} aria-hidden="true" />
                Signed in as
              </dt>
              <dd className="mt-1 text-sm text-[#1a1a1a]">
                <code className="rounded-none bg-[#fafafa] px-1.5 py-0.5 text-xs">{admin.username}</code>
              </dd>
            </div>
          </dl>
        </AdminPanel>
      </motion.div>
    </AdminPage>
  )
}

export default AdminSettingsPage
