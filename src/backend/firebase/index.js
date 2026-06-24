export { firebaseConfig } from './config'
export { firebaseApp } from './app'
export { db } from './firestore'
export { storage } from './storage'
export { getFirebaseAnalytics, initAnalytics } from './analytics'
export {
  auth,
  googleProvider,
  onAuthStateChanged,
  signInWithGoogle,
  completeGoogleRedirectSignIn,
  signInWithGooglePopup,
  signOutFirebase,
} from './auth'
export { getFirebaseAuthErrorMessage, isGoogleRedirectPreferred } from './authErrors'
