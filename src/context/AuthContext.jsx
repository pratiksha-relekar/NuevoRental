import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  completeGoogleRedirectSignIn,
  onAuthStateChanged,
  signInWithGoogle,
  signOutFirebase,
} from '../backend/firebase/auth'
import { getFirebaseAuthErrorMessage } from '../backend/firebase/authErrors'
import {
  loginEmailUser,
  registerEmailUser,
  updateUserProfile as updateFirestoreUserProfile,
  upsertGoogleUser,
} from '../backend/firestore/users'
import { refreshWishlistAddresses } from '../backend/firestore/wishlist'
import { refreshCartAddresses } from '../backend/firestore/cart'
import {
  clearCustomerSessionCache,
  emitCustomerLogout,
  SESSION_CACHE_KEYS,
} from '../utils/sessionCache'

const AUTH_USER_KEY = SESSION_CACHE_KEYS.AUTH_USER
const AUTH_USERS_KEY = SESSION_CACHE_KEYS.AUTH_USERS
const GOOGLE_AUTH_ERROR_KEY = 'nuevo-rental-google-auth-error'

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
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key)
      return
    }
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
    let active = true

    async function bootstrapGoogleRedirect() {
      try {
        const redirectUser = await completeGoogleRedirectSignIn()
        if (!active || !redirectUser?.email) return

        const sessionUser = await upsertGoogleUser(redirectUser)
        if (active) {
          setUser(sessionUser)
          saveToStorage(GOOGLE_AUTH_ERROR_KEY, null)
        }
      } catch (error) {
        if (active) {
          saveToStorage(
            GOOGLE_AUTH_ERROR_KEY,
            getFirebaseAuthErrorMessage(error),
          )
        }
      }
    }

    bootstrapGoogleRedirect()

    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const sessionUser = await upsertGoogleUser(firebaseUser)
          if (active) {
            setUser(sessionUser)
            saveToStorage(GOOGLE_AUTH_ERROR_KEY, null)
          }
        } catch (error) {
          if (active) {
            saveToStorage(
              GOOGLE_AUTH_ERROR_KEY,
              getFirebaseAuthErrorMessage(
                error,
                'Signed in with Google, but we could not load your account. Please try again.',
              ),
            )
          }
        }
      } else {
        setUser((current) => (current?.provider === 'google' ? null : current))
      }
      if (active) {
        setAuthReady(true)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
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
    const result = await signInWithGoogle()
    if (result.redirecting) {
      return { redirecting: true }
    }

    const sessionUser = await upsertGoogleUser(result.user)
    setUser(sessionUser)
    saveToStorage(GOOGLE_AUTH_ERROR_KEY, null)
    return { redirecting: false, user: sessionUser }
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
    try {
      await refreshWishlistAddresses(user.email, result.user)
      await refreshCartAddresses(user.email, result.user)
    } catch {
      // Wishlist/cart address sync is best-effort.
    }
    return result
  }, [user?.email])

  const logout = useCallback(async () => {
    const email = user?.email ?? null

    if (user?.provider === 'google') {
      try {
        await signOutFirebase()
      } catch {
        // Clear local session even if Firebase sign-out fails.
      }
    }

    clearCustomerSessionCache(email)
    emitCustomerLogout()
    setUser(null)
  }, [user?.email, user?.provider])

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
