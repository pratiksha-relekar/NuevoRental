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
import {
  DEFAULT_ADMIN_SETTINGS,
  formatAdminRole,
  formatAdminSessionTime,
  isUsingDefaultAdminPassword,
} from '../../data/adminStorage'
import './AdminSettingsPage.css'

function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="admin-settings-field">
      <span>{label}</span>
      <div className="admin-settings-password-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="admin-settings-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
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
    <div className="admin-settings-page">
      <header className="admin-settings-page-head">
        <div>
          <h1>Settings</h1>
          <p>Manage your Nuevo Rental admin profile, security credentials, and active session.</p>
        </div>
      </header>

      <motion.section
        className="admin-settings-card"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-settings-card-head">
          <div>
            <h2>Admin profile</h2>
            <p>Your name and contact email used across the admin panel.</p>
          </div>
          {!isEditingProfile && (
            <button type="button" className="admin-settings-edit-btn" onClick={handleStartEdit}>
              <Pencil size={15} aria-hidden="true" />
              Edit profile
            </button>
          )}
        </div>

        <div className="admin-settings-profile-banner">
          <div className="admin-settings-profile-main">
            <span className="admin-settings-avatar" aria-hidden="true">
              {initials}
            </span>
            <div>
              <strong>{admin.displayName}</strong>
              <span className="admin-settings-role-badge">
                <Shield size={13} aria-hidden="true" />
                {formatAdminRole(admin.role)}
              </span>
            </div>
          </div>
          <span className="admin-settings-brand-logo" aria-hidden="true">NR</span>
        </div>

        {profileMessage && <p className="admin-settings-success">{profileMessage}</p>}
        {profileError && <p className="admin-settings-error">{profileError}</p>}

        {isEditingProfile ? (
          <form className="admin-settings-profile-form" onSubmit={handleSaveProfile}>
            <div className="admin-settings-details-grid">
              <label className="admin-settings-field">
                <span>
                  <User size={14} aria-hidden="true" />
                  Display name
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Administrator"
                />
              </label>
              <label className="admin-settings-field">
                <span>
                  <Mail size={14} aria-hidden="true" />
                  Contact email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nuevorental.com"
                />
              </label>
            </div>
            <div className="admin-settings-form-actions">
              <button type="button" className="admin-settings-btn admin-settings-btn--ghost" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button type="submit" className="admin-settings-btn admin-settings-btn--primary">
                Save profile
              </button>
            </div>
          </form>
        ) : (
          <dl className="admin-settings-details-grid admin-settings-details-grid--static">
            <div>
              <dt>
                <User size={14} aria-hidden="true" />
                Username
              </dt>
              <dd>
                <code>{admin.username}</code>
                <small>Username cannot be changed.</small>
              </dd>
            </div>
            <div>
              <dt>
                <User size={14} aria-hidden="true" />
                Display name
              </dt>
              <dd>{admin.displayName}</dd>
            </div>
            <div>
              <dt>
                <Mail size={14} aria-hidden="true" />
                Contact email
              </dt>
              <dd>{admin.email}</dd>
            </div>
            <div>
              <dt>
                <Shield size={14} aria-hidden="true" />
                Role
              </dt>
              <dd>{formatAdminRole(admin.role)}</dd>
            </div>
          </dl>
        )}
      </motion.section>

      <motion.section
        className="admin-settings-card"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-settings-card-head">
          <div>
            <h2>Change password</h2>
            <p>Pick a new password — at least 6 characters and different from your current one.</p>
          </div>
        </div>

        {usingDefaultPassword && (
          <div className="admin-settings-warning" role="alert">
            <Lock size={18} aria-hidden="true" />
            <p>
              You&apos;re still using the default password (
              <code>{DEFAULT_ADMIN_SETTINGS.password}</code>). Change it now to secure the Nuevo
              Rental admin panel.
            </p>
          </div>
        )}

        {passwordMessage && <p className="admin-settings-success">{passwordMessage}</p>}
        {passwordError && <p className="admin-settings-error">{passwordError}</p>}

        <form className="admin-settings-password-form" onSubmit={handlePasswordSubmit}>
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter your current password"
            autoComplete="current-password"
          />

          <div className="admin-settings-password-row">
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

          <div className="admin-settings-form-actions admin-settings-form-actions--end">
            <button
              type="submit"
              className="admin-settings-btn admin-settings-btn--primary"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </motion.section>

      <motion.section
        className="admin-settings-card admin-settings-card--session"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-settings-card-head">
          <div>
            <h2>Session</h2>
            <p>Current admin session details.</p>
          </div>
        </div>

        <button
          type="button"
          className="admin-settings-signout-btn"
          onClick={() => {
            logout()
            navigate('/admin/login', { replace: true })
          }}
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>

        <dl className="admin-settings-session-grid">
          <div>
            <dt>
              <Calendar size={14} aria-hidden="true" />
              Logged in since
            </dt>
            <dd>{formatAdminSessionTime(admin.loggedInAt)}</dd>
          </div>
          <div>
            <dt>
              <User size={14} aria-hidden="true" />
              Signed in as
            </dt>
            <dd>
              <code>{admin.username}</code>
            </dd>
          </div>
        </dl>
      </motion.section>
    </div>
  )
}

export default AdminSettingsPage
