import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const AUTH_USER_KEY = 'nuevo-rental-auth-user'
const AUTH_USERS_KEY = 'nuevo-rental-auth-users'

const AuthContext = createContext(null)

function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private mode errors
  }
}

function displayNameFromEmail(email) {
  const local = email.split('@')[0] ?? 'User'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildUser({
  firstName = '',
  lastName = '',
  email,
  provider = 'email',
  phone = '',
  location = '',
  aboutMe = '',
  memberSince = null,
}) {
  const trimmedFirst = firstName.trim()
  const trimmedLast = lastName.trim()
  const displayName =
    [trimmedFirst, trimmedLast].filter(Boolean).join(' ') ||
    displayNameFromEmail(email)

  return {
    firstName: trimmedFirst,
    lastName: trimmedLast,
    email: email.trim().toLowerCase(),
    displayName,
    provider,
    phone: phone.trim(),
    location: location.trim(),
    aboutMe: aboutMe.trim(),
    memberSince: memberSince ?? new Date().toISOString(),
  }
}

function loadRegisteredUsers() {
  return loadFromStorage(AUTH_USERS_KEY, {})
}

function saveRegisteredUser(user) {
  const users = loadRegisteredUsers()
  users[user.email] = {
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    phone: user.phone,
    location: user.location,
    aboutMe: user.aboutMe,
    memberSince: user.memberSince,
    provider: user.provider,
  }
  saveToStorage(AUTH_USERS_KEY, users)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(AUTH_USER_KEY, null))

  useEffect(() => {
    saveToStorage(AUTH_USER_KEY, user)
  }, [user])

  const login = useCallback(({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const registered = loadRegisteredUsers()[normalizedEmail]

    const nextUser = buildUser({
      firstName: registered?.firstName ?? '',
      lastName: registered?.lastName ?? '',
      email: normalizedEmail,
      provider: registered?.provider ?? 'email',
      phone: registered?.phone ?? '',
      location: registered?.location ?? '',
      aboutMe: registered?.aboutMe ?? '',
      memberSince: registered?.memberSince ?? null,
    })

    setUser(nextUser)
    return { ok: true, user: nextUser }
  }, [])

  const signUp = useCallback(({ firstName, lastName, email }) => {
    const nextUser = buildUser({ firstName, lastName, email, provider: 'email' })
    saveRegisteredUser(nextUser)
    setUser(nextUser)
    return { ok: true, user: nextUser }
  }, [])

  const loginWithGoogle = useCallback(() => {
    const email = 'google.user@nuevorental.com'
    const registered = loadRegisteredUsers()[email]

    const nextUser = buildUser({
      firstName: registered?.firstName ?? 'Google',
      lastName: registered?.lastName ?? 'User',
      email,
      provider: 'google',
      phone: registered?.phone ?? '',
      location: registered?.location ?? '',
      aboutMe: registered?.aboutMe ?? '',
      memberSince: registered?.memberSince ?? null,
    })
    saveRegisteredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev

      const nextUser = buildUser({
        firstName: updates.firstName ?? prev.firstName,
        lastName: updates.lastName ?? prev.lastName,
        email: prev.email,
        provider: prev.provider,
        phone: updates.phone ?? prev.phone,
        location: updates.location ?? prev.location,
        aboutMe: updates.aboutMe ?? prev.aboutMe,
        memberSince: prev.memberSince,
      })

      saveRegisteredUser(nextUser)
      return nextUser
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signUp,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [user, login, signUp, loginWithGoogle, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
