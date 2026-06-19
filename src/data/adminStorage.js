const ADMIN_SETTINGS_KEY = 'nuevo-rental-admin-settings'

export const DEFAULT_ADMIN_SETTINGS = {
  username: 'admin',
  password: 'admin123',
  displayName: 'Administrator',
  email: 'admin@nuevorental.com',
  role: 'super_admin',
  passwordChangedAt: null,
}

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export function loadAdminSettings() {
  return { ...DEFAULT_ADMIN_SETTINGS, ...loadJson(ADMIN_SETTINGS_KEY, {}) }
}

export function saveAdminSettings(settings) {
  saveJson(ADMIN_SETTINGS_KEY, settings)
}

export function updateAdminProfile({ displayName, email }) {
  const current = loadAdminSettings()
  const next = {
    ...current,
    displayName: displayName?.trim() || current.displayName,
    email: email?.trim().toLowerCase() || current.email,
  }
  saveAdminSettings(next)
  return next
}

export function changeAdminPassword({ currentPassword, newPassword }) {
  const current = loadAdminSettings()

  if (currentPassword !== current.password) {
    return { ok: false, error: 'Current password is incorrect.' }
  }

  if (newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' }
  }

  if (newPassword === current.password) {
    return { ok: false, error: 'New password must be different from your current password.' }
  }

  const next = {
    ...current,
    password: newPassword,
    passwordChangedAt: new Date().toISOString(),
  }
  saveAdminSettings(next)
  return { ok: true, settings: next }
}

export function isUsingDefaultAdminPassword() {
  return loadAdminSettings().password === DEFAULT_ADMIN_SETTINGS.password
}

export function formatAdminRole(role) {
  if (!role) return 'Admin'
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatAdminSessionTime(isoDate) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
