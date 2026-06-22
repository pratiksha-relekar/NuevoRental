import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  onAuthStateChanged,
  signInWithGooglePopup,
  signOutFirebase,
} from '../backend/firebase/auth'
import {
  loginEmailUser,
  registerEmailUser,
  updateUserProfile as updateFirestoreUserProfile,
  upsertGoogleUser,
} from '../backend/firestore/users'

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

function mirrorUserToLocalRegistry(user) {
  if (!user?.email) return

  const users = loadFromStorage(AUTH_USERS_KEY, {})
  users[user.email] = {
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    phone: user.phone,
    location: user.location,
    aboutMe: user.aboutMe,
    memberSince: user.memberSince,
    provider: user.provider,
    photoURL: user.photoURL ?? '',
    uid: user.uid ?? '',
  }
  saveToStorage(AUTH_USERS_KEY, users)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(AUTH_USER_KEY, null))
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    saveToStorage(AUTH_USER_KEY, user)
    if (user) {
      mirrorUserToLocalRegistry(user)
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const sessionUser = await upsertGoogleUser(firebaseUser)
          setUser(sessionUser)
        } catch {
          // Keep existing local session if Firestore sync fails.
        }
      } else {
        setUser((current) => (current?.provider === 'google' ? null : current))
      }
      setAuthReady(true)
    })

    return unsubscribe
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const result = await loginEmailUser({ email, password })
    if (!result.ok) {
      return result
    }

    setUser(result.user)
    return result
  }, [])

  const signUp = useCallback(async ({ firstName, lastName, email, password }) => {
    const result = await registerEmailUser({ firstName, lastName, email, password })
    if (!result.ok) {
      return result
    }

    setUser(result.user)
    return result
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const firebaseUser = await signInWithGooglePopup()
    const sessionUser = await upsertGoogleUser(firebaseUser)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user?.email) {
      return { ok: false, error: 'You must be logged in to update your profile.' }
    }

    const result = await updateFirestoreUserProfile(user.email, updates)
    if (!result.ok) {
      return result
    }

    setUser(result.user)
    return result
  }, [user?.email])

  const logout = useCallback(async () => {
    if (user?.provider === 'google') {
      try {
        await signOutFirebase()
      } catch {
        // Clear local session even if Firebase sign-out fails.
      }
    }
    setUser(null)
  }, [user?.provider])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      login,
      signUp,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [user, authReady, login, signUp, loginWithGoogle, logout, updateProfile],
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
