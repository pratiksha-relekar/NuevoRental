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
import { ensureAdminCatalogUser } from '../backend/firestore/adminCatalog'
import { refreshAdminCaches } from '../data/userStorage'
import {
  clearAdminSessionCache,
  SESSION_CACHE_KEYS,
} from '../utils/sessionCache'

const ADMIN_SESSION_KEY = SESSION_CACHE_KEYS.ADMIN_SESSION

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
    privileges: session.privileges ?? [
      'manage_products',
      'manage_categories',
      'manage_orders',
      'manage_users',
      'manage_kyc',
      'manage_content',
      'manage_support',
    ],
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => hydrateSession(loadSession()))

  useEffect(() => {
    saveSession(admin)
  }, [admin])

  const login = useCallback(async ({ username, password }) => {
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
        role: settings.role,
        privileges: [
          'manage_products',
          'manage_categories',
          'manage_orders',
          'manage_users',
          'manage_kyc',
          'manage_content',
          'manage_support',
        ],
        loggedInAt: new Date().toISOString(),
      }

      try {
        await ensureAdminCatalogUser(session)
        await refreshAdminCaches()
      } catch {
        // Allow admin login even if Firestore sync fails.
      }

      setAdmin(session)
      return { ok: true, admin: session }
    }

    return { ok: false, error: 'Invalid admin username or password.' }
  }, [])

  const logout = useCallback(() => {
    clearAdminSessionCache()
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
