import { getAnalytics, isSupported } from 'firebase/analytics'
import { firebaseApp } from './app'

let analyticsInstance = null

export async function initAnalytics() {
  if (typeof window === 'undefined' || analyticsInstance) {
    return analyticsInstance
  }

  try {
    const supported = await isSupported()
    if (!supported) return null

    analyticsInstance = getAnalytics(firebaseApp)
    return analyticsInstance
  } catch {
    return null
  }
}

export function getFirebaseAnalytics() {
  return analyticsInstance
}
