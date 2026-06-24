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
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  completeGoogleRedirectSignIn,
  registerWithEmailPassword,
  signInWithEmailPassword,
  getAuthErrorMessage,
  saveAuthRedirectPath,
  consumeAuthRedirectPath,
  signOutFirebase,
} from './auth'
