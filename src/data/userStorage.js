import { deleteUserByEmail, fetchAllUsers } from '../backend/firestore/users'

const AUTH_USER_KEY = 'nuevo-rental-auth-user'
const AUTH_USERS_KEY = 'nuevo-rental-auth-users'
const ORDERS_KEY = 'nuevo-rental-orders'
const KYC_KEY = 'nuevo-rental-kyc-records'

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
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

function getInitials(name, email) {
  const source = name || email || 'U'
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

function formatJoinedDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function mapProfileToAdminUser(email, profile, orders, kycRecords, currentSession) {
  const orderCount = Array.isArray(orders[email]) ? orders[email].length : 0
  const kycStatus =
    profile.kycStatus
    ?? profile.kycIndex?.status
    ?? kycRecords[email]?.status
    ?? 'not_started'

  return {
    email,
    displayName: profile.displayName || email.split('@')[0],
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    location: profile.location ?? '',
    aboutMe: profile.aboutMe ?? '',
    provider: profile.provider ?? 'email',
    memberSince: profile.memberSince ?? null,
    orderCount,
    kycStatus,
    isOnline: currentSession?.email === email,
    initials: getInitials(profile.displayName, email),
    joinedLabel: formatJoinedDate(profile.memberSince),
    role: orderCount > 0 ? 'renter' : 'customer',
  }
}

export function loadAdminUsers() {
  const users = loadJson(AUTH_USERS_KEY, {})
  const currentSession = loadJson(AUTH_USER_KEY, null)
  const orders = loadJson(ORDERS_KEY, {})
  const kycRecords = loadJson(KYC_KEY, {})

  return Object.entries(users).map(([email, profile]) =>
    mapProfileToAdminUser(email, profile, orders, kycRecords, currentSession),
  )
}

export async function fetchAdminUsers() {
  const currentSession = loadJson(AUTH_USER_KEY, null)
  const orders = loadJson(ORDERS_KEY, {})
  const kycRecords = loadJson(KYC_KEY, {})

  try {
    const firestoreUsers = await fetchAllUsers()
    if (firestoreUsers.length > 0) {
      const mapped = firestoreUsers.map((profile) => {
        const email = profile.email ?? profile.id
        return mapProfileToAdminUser(email, profile, orders, kycRecords, currentSession)
      })

      const registry = {}
      firestoreUsers.forEach((profile) => {
        const email = profile.email ?? profile.id
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
        }
      })
      saveJson(AUTH_USERS_KEY, registry)

      return mapped
    }
  } catch {
    // Fall back to local registry when Firestore is unavailable.
  }

  return loadAdminUsers()
}

export function getAdminUserStats(users) {
  const totalUsers = users.length
  const activeRenters = users.filter((user) => user.orderCount > 0).length
  const kycVerified = users.filter((user) => user.kycStatus === 'approved').length
  const onlineNow = users.filter((user) => user.isOnline).length
  const googleUsers = users.filter((user) => user.provider === 'google').length
  const emailUsers = users.filter((user) => user.provider === 'email').length
  const totalOrders = users.reduce((sum, user) => sum + user.orderCount, 0)

  return {
    totalUsers,
    activeRenters,
    kycVerified,
    onlineNow,
    googleUsers,
    emailUsers,
    totalOrders,
    renterPercent: totalUsers > 0 ? Math.round((activeRenters / totalUsers) * 100) : 0,
  }
}

export async function deleteRegisteredUser(email) {
  try {
    await deleteUserByEmail(email)
  } catch {
    // Continue with local cleanup even if Firestore delete fails.
  }

  const users = loadJson(AUTH_USERS_KEY, {})
  delete users[email]
  saveJson(AUTH_USERS_KEY, users)

  const orders = loadJson(ORDERS_KEY, {})
  delete orders[email]
  saveJson(ORDERS_KEY, orders)

  const kycRecords = loadJson(KYC_KEY, {})
  delete kycRecords[email]
  saveJson(KYC_KEY, kycRecords)

  const currentSession = loadJson(AUTH_USER_KEY, null)
  if (currentSession?.email === email) {
    saveJson(AUTH_USER_KEY, null)
  }
}

export function formatKycStatus(status) {
  if (status === 'approved') return 'Verified'
  if (status === 'in_review') return 'Awaiting review'
  if (status === 'in_progress') return 'In progress'
  if (status === 'pending') return 'Pending'
  if (status === 'rejected') return 'Rejected'
  return 'Not started'
}
