import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  completeGoogleRedirectSignIn,
  consumeAuthRedirectPath,
  isGoogleProviderUser,
  onAuthStateChanged,
  saveAuthRedirectPath,
  signInWithGoogle,
  signOutFirebase,
} from '../backend/firebase/auth'
import {
  loginEmailUser,
  registerEmailUser,
  updateUserProfile as updateFirestoreUserProfile,
  upsertEmailFirebaseUser,
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

async function syncFirebaseUser(firebaseUser) {
  if (isGoogleProviderUser(firebaseUser)) {
    return upsertGoogleUser(firebaseUser)
  }
  return upsertEmailFirebaseUser(firebaseUser)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(AUTH_USER_KEY, null))
  const [authReady, setAuthReady] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(false)
  const manualAuthRef = useRef(false)

  useEffect(() => {
    saveToStorage(AUTH_USER_KEY, user)
    if (user) {
      mirrorUserToLocalRegistry(user)
    }
  }, [user])

  useEffect(() => {
    let active = true

    async function bootstrapAuth() {
      try {
        const redirectUser = await completeGoogleRedirectSignIn()
        if (!active) return

        if (redirectUser) {
          manualAuthRef.current = true
          const sessionUser = await syncFirebaseUser(redirectUser)
          setUser(sessionUser)
          setPendingRedirect(true)
        }
      } catch (error) {
        if (active) {
          console.error('Google redirect sign-in failed:', error)
        }
      }

      const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
        if (!active) return

        if (firebaseUser?.email) {
          if (manualAuthRef.current) {
            manualAuthRef.current = false
            setAuthReady(true)
            return
          }

          try {
            const sessionUser = await syncFirebaseUser(firebaseUser)
            setUser(sessionUser)
          } catch (error) {
            console.error('Failed to sync Firebase user profile:', error)
          }
        } else {
          setUser((current) => {
            if (!current) return null
            if (current.provider === 'google' || current.uid) return null
            return current
          })
        }

        setAuthReady(true)
      })

      return unsubscribe
    }

    let unsubscribe = () => {}
    bootstrapAuth().then((unsub) => {
      if (typeof unsub === 'function') {
        unsubscribe = unsub
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    manualAuthRef.current = true
    const result = await loginEmailUser({ email, password })
    if (!result.ok) {
      manualAuthRef.current = false
      return result
    }

    setUser(result.user)
    return result
  }, [])

  const signUp = useCallback(async ({ firstName, lastName, email, password }) => {
    manualAuthRef.current = true
    const result = await registerEmailUser({ firstName, lastName, email, password })
    if (!result.ok) {
      manualAuthRef.current = false
      return result
    }

    setUser(result.user)
    return result
  }, [])

  const loginWithGoogle = useCallback(async (redirectPath = '/dashboard') => {
    saveAuthRedirectPath(redirectPath)
    manualAuthRef.current = true

    try {
      const firebaseUser = await signInWithGoogle()
      if (!firebaseUser) {
        return null
      }

      const sessionUser = await syncFirebaseUser(firebaseUser)
      setUser(sessionUser)
      return sessionUser
    } catch (error) {
      manualAuthRef.current = false
      throw error
    }
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

    if (user?.provider === 'google' || user?.uid) {
      try {
        await signOutFirebase()
      } catch {
        // Clear local session even if Firebase sign-out fails.
      }
    }

    clearCustomerSessionCache(email)
    emitCustomerLogout()
    setUser(null)
    setPendingRedirect(false)
  }, [user?.email, user?.provider, user?.uid])

  const consumeRedirect = useCallback(() => {
    setPendingRedirect(false)
    return consumeAuthRedirectPath('/dashboard')
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      pendingRedirect,
      consumeRedirect,
      login,
      signUp,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [user, authReady, pendingRedirect, consumeRedirect, login, signUp, loginWithGoogle, logout, updateProfile],
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
