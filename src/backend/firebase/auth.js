import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { firebaseApp } from './app'

export const AUTH_REDIRECT_KEY = 'nuevo-rental-auth-redirect'

export const auth = getAuth(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
googleProvider.addScope('email')
googleProvider.addScope('profile')

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment',
])

export function getAuthErrorMessage(error) {
  const code = error?.code ?? ''
  const messages = {
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Your browser blocked the sign-in popup. Redirecting to Google…',
    'auth/unauthorized-domain':
      'This website is not authorized for Google sign-in yet. Please use email login or contact support.',
    'auth/account-exists-with-different-credential':
      'This email is already registered with a password. Log in with email and password instead.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please log in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/internal-error': 'Sign-in could not be completed. Please try again.',
  }

  return messages[code] ?? error?.message ?? 'Authentication failed. Please try again.'
}

export function isGoogleProviderUser(firebaseUser) {
  return firebaseUser?.providerData?.some((provider) => provider.providerId === 'google.com') ?? false
}

export function saveAuthRedirectPath(path) {
  try {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, path)
  } catch {
    // Ignore storage errors.
  }
}

export function consumeAuthRedirectPath(fallback = '/dashboard') {
  try {
    const path = sessionStorage.getItem(AUTH_REDIRECT_KEY)
    sessionStorage.removeItem(AUTH_REDIRECT_KEY)
    return path || fallback
  } catch {
    return fallback
  }
}

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInWithGoogleRedirect() {
  await signInWithRedirect(auth, googleProvider)
}

export async function signInWithGoogle() {
  try {
    return await signInWithGooglePopup()
  } catch (error) {
    if (POPUP_FALLBACK_CODES.has(error?.code)) {
      await signInWithGoogleRedirect()
      return null
    }
    throw error
  }
}

export async function completeGoogleRedirectSignIn() {
  const result = await getRedirectResult(auth)
  return result?.user ?? null
}

export async function registerWithEmailPassword({ email, password, displayName = '' }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() })
  }
  return credential.user
}

export async function signInWithEmailPassword({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signOutFirebase() {
  await signOut(auth)
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback)
}
