import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { firebaseApp } from './app'

export const auth = getAuth(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOutFirebase() {
  await signOut(auth)
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback)
}
