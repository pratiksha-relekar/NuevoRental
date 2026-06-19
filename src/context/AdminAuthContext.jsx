import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  changeAdminPassword,
  loadAdminSettings,
  updateAdminProfile,
} from '../data/adminStorage'

const ADMIN_SESSION_KEY = 'nuevo-rental-admin-session'

const AdminAuthContext = createContext(null)

function loadSession() {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  try {
    if (session) {
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(ADMIN_SESSION_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

function hydrateSession(session) {
  if (!session) return null
  const settings = loadAdminSettings()

  return {
    ...session,
    username: settings.username,
    displayName: session.displayName ?? settings.displayName,
    email: settings.email,
    role: settings.role,
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => hydrateSession(loadSession()))

  useEffect(() => {
    saveSession(admin)
  }, [admin])

  const login = useCallback(({ username, password }) => {
    const settings = loadAdminSettings()
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (
      normalizedUsername === settings.username &&
      normalizedPassword === settings.password
    ) {
      const session = {
        username: settings.username,
        displayName: settings.displayName,
        email: settings.email,
        role: settings.role,
        loggedInAt: new Date().toISOString(),
      }
      setAdmin(session)
      return { ok: true, admin: session }
    }

    return { ok: false, error: 'Invalid admin username or password.' }
  }, [])

  const logout = useCallback(() => {
    setAdmin(null)
  }, [])

  const updateProfile = useCallback(({ displayName, email }) => {
    const settings = updateAdminProfile({ displayName, email })
    setAdmin((current) =>
      current
        ? {
            ...current,
            displayName: settings.displayName,
            email: settings.email,
          }
        : current,
    )
    return { ok: true, settings }
  }, [])

  const updatePassword = useCallback(({ currentPassword, newPassword }) => {
    return changeAdminPassword({ currentPassword, newPassword })
  }, [])

  const refreshAdminProfile = useCallback(() => {
    setAdmin((current) => (current ? hydrateSession(current) : current))
  }, [])

  const value = useMemo(
    () => ({
      admin,
      isAdminAuthenticated: Boolean(admin),
      login,
      logout,
      updateProfile,
      updatePassword,
      refreshAdminProfile,
    }),
    [admin, login, logout, updateProfile, updatePassword, refreshAdminProfile],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
