const AUTH_USER_KEY = 'nuevo-rental-auth-user'
const AUTH_USERS_KEY = 'nuevo-rental-auth-users'
const CART_KEY = 'nuevo-rental-cart'
const WISHLIST_KEY = 'nuevo-rental-wishlist'
const ORDERS_KEY = 'nuevo-rental-orders'
const KYC_KEY = 'nuevo-rental-kyc-records'
const ADMIN_SESSION_KEY = 'nuevo-rental-admin-session'

export const SESSION_CACHE_KEYS = {
  AUTH_USER: AUTH_USER_KEY,
  AUTH_USERS: AUTH_USERS_KEY,
  CART: CART_KEY,
  WISHLIST: WISHLIST_KEY,
  ORDERS: ORDERS_KEY,
  KYC: KYC_KEY,
  ADMIN_SESSION: ADMIN_SESSION_KEY,
}

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors.
  }
}

function removeUserFromMirror(key, email) {
  if (!email) return
  const records = loadJson(key, {})
  delete records[email]
  saveJson(key, records)
}

export function clearGuestCartWishlistCache() {
  saveJson(CART_KEY, [])
  saveJson(WISHLIST_KEY, [])
}

export function clearCustomerSessionCache(userEmail = null) {
  saveJson(AUTH_USER_KEY, null)

  clearGuestCartWishlistCache()

  if (userEmail) {
    removeUserFromMirror(ORDERS_KEY, userEmail)
    removeUserFromMirror(KYC_KEY, userEmail)
  }
}

export function clearAdminDataCaches() {
  saveJson(AUTH_USERS_KEY, {})
  saveJson(ORDERS_KEY, {})
  saveJson(KYC_KEY, {})
}

export function clearAdminSessionCache() {
  saveJson(ADMIN_SESSION_KEY, null)
  clearAdminDataCaches()
}

export function purgeDeletedUserFromCaches(email) {
  if (!email) return

  const users = loadJson(AUTH_USERS_KEY, {})
  delete users[email]
  saveJson(AUTH_USERS_KEY, users)

  removeUserFromMirror(ORDERS_KEY, email)
  removeUserFromMirror(KYC_KEY, email)
}

export function replaceAuthUsersRegistry(users) {
  const registry = {}

  users.forEach((profile) => {
    const email = profile.email ?? profile.id
    if (!email || profile.provider === 'admin' || profile.isAdmin) return

    registry[email] = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      phone: profile.phone,
      location: profile.location,
      aboutMe: profile.aboutMe,
      memberSince: profile.memberSince,
      provider: profile.provider,
      photoURL: profile.photoURL ?? '',
      uid: profile.uid ?? '',
      kycStatus: profile.kycStatus ?? profile.kycIndex?.status ?? 'not_started',
    }
  })

  saveJson(AUTH_USERS_KEY, registry)
  return registry
}

export function loadGuestCartFromCache() {
  return loadJson(CART_KEY, [])
}

export function loadGuestWishlistFromCache() {
  return loadJson(WISHLIST_KEY, [])
}

export const CUSTOMER_LOGOUT_EVENT = 'nuevo-rental:customer-logout'

export function emitCustomerLogout() {
  window.dispatchEvent(new CustomEvent(CUSTOMER_LOGOUT_EVENT))
}
