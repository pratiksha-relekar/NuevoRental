import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { firebaseApp } from './app'
import { isGoogleRedirectPreferred } from './authErrors'

export const auth = getAuth(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment',
])

export async function completeGoogleRedirectSignIn() {
  const result = await getRedirectResult(auth)
  return result?.user ?? null
}

export async function signInWithGoogle() {
  if (isGoogleRedirectPreferred()) {
    await signInWithRedirect(auth, googleProvider)
    return { redirecting: true, user: null }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { redirecting: false, user: result.user }
  } catch (error) {
    if (POPUP_FALLBACK_CODES.has(error?.code)) {
      await signInWithRedirect(auth, googleProvider)
      return { redirecting: true, user: null }
    }
    throw error
  }
}

/** @deprecated Use signInWithGoogle instead */
export async function signInWithGooglePopup() {
  const result = await signInWithGoogle()
  if (result.redirecting) {
    return null
  }
  return result.user
}

export async function signOutFirebase() {
  await signOut(auth)
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback)
}
