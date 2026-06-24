const AUTH_ERROR_MESSAGES = {
  'auth/unauthorized-domain': (hostname) =>
    `This site (${hostname}) is not authorized for Google sign-in. In Firebase Console → Authentication → Settings → Authorized domains, add "${hostname}".`,
  'auth/operation-not-allowed':
    'Google sign-in is not enabled. Enable the Google provider in Firebase Console → Authentication → Sign-in method.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in popup. Allow popups for this site or try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Google sign-in was interrupted. Please try again.',
  'auth/network-request-failed':
    'Network error during Google sign-in. Check your connection and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/invalid-credential': 'Google sign-in credentials are invalid. Please try again.',
  'auth/user-disabled': 'This Google account has been disabled.',
}

export function getFirebaseAuthErrorMessage(error, fallback = 'Google sign-in failed. Please try again.') {
  if (!error) return fallback

  const code = error.code ?? ''
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain'

  if (code === 'auth/unauthorized-domain') {
    return AUTH_ERROR_MESSAGES['auth/unauthorized-domain'](hostname)
  }

  if (AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code]
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function isGoogleRedirectPreferred() {
  if (typeof window === 'undefined') return false

  const host = window.location.hostname
  return host !== 'localhost' && host !== '127.0.0.1'
}
