import { COLLECTIONS } from './collections'
import {
  fetchCollection,
  fetchDocument,
  patchDocument,
  removeDocument,
  saveDocument,
} from './client'
import {
  getAuthErrorMessage,
  registerWithEmailPassword,
  signInWithEmailPassword,
} from '../firebase/auth'

export function normalizeUserEmail(email) {
  return email.trim().toLowerCase()
}

export function getUserDocumentId(email) {
  return normalizeUserEmail(email)
}

function displayNameFromEmail(email) {
  const local = email.split('@')[0] ?? 'User'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function buildUserRecord({
  email,
  firstName = '',
  lastName = '',
  displayName = '',
  provider = 'email',
  password = '',
  phone = '',
  location = '',
  aboutMe = '',
  photoURL = '',
  uid = '',
  memberSince = null,
  createdAt = null,
  lastLoginAt = null,
}) {
  const normalizedEmail = normalizeUserEmail(email)
  const trimmedFirst = firstName.trim()
  const trimmedLast = lastName.trim()
  const resolvedDisplayName =
    displayName.trim() ||
    [trimmedFirst, trimmedLast].filter(Boolean).join(' ') ||
    displayNameFromEmail(normalizedEmail)

  const now = new Date().toISOString()

  return {
    email: normalizedEmail,
    firstName: trimmedFirst,
    lastName: trimmedLast,
    displayName: resolvedDisplayName,
    provider,
    phone: phone.trim(),
    location: location.trim(),
    aboutMe: aboutMe.trim(),
    photoURL: photoURL.trim(),
    uid: uid.trim(),
    memberSince: memberSince ?? now,
    createdAt: createdAt ?? now,
    updatedAt: now,
    lastLoginAt: lastLoginAt ?? now,
    ...(provider === 'email' && password ? { password } : {}),
  }
}

export function toSessionUser(record) {
  if (!record) return null

  return {
    email: record.email,
    firstName: record.firstName ?? '',
    lastName: record.lastName ?? '',
    displayName: record.displayName ?? displayNameFromEmail(record.email),
    provider: record.provider ?? 'email',
    phone: record.phone ?? '',
    location: record.location ?? '',
    aboutMe: record.aboutMe ?? '',
    photoURL: record.photoURL ?? '',
    uid: record.uid ?? '',
    memberSince: record.memberSince ?? record.createdAt ?? null,
  }
}

export async function getUserByEmail(email) {
  const id = getUserDocumentId(email)
  return fetchDocument(COLLECTIONS.users, id)
}

export async function fetchAllUsers() {
  return fetchCollection(COLLECTIONS.users)
}

export async function saveUserRecord(record) {
  const id = getUserDocumentId(record.email)
  await saveDocument(COLLECTIONS.users, id, {
    ...record,
    email: id,
    updatedAt: new Date().toISOString(),
  })
  return { id, ...record, email: id }
}

export async function registerEmailUser({ firstName, lastName, email, password }) {
  const normalizedEmail = normalizeUserEmail(email)
  const existing = await getUserByEmail(normalizedEmail)

  if (existing) {
    if (existing.provider === 'google') {
      return {
        ok: false,
        error: 'This email is linked to Google sign-in. Continue with Google instead.',
      }
    }
    return { ok: false, error: 'An account with this email already exists. Please log in.' }
  }

  try {
    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const firebaseUser = await registerWithEmailPassword({
      email: normalizedEmail,
      password,
      displayName,
    })

    const record = buildUserRecord({
      firstName,
      lastName,
      email: normalizedEmail,
      provider: 'email',
      uid: firebaseUser.uid,
    })

    const saved = await saveUserRecord(record)
    return { ok: true, user: toSessionUser(saved) }
  } catch (error) {
    return { ok: false, error: getAuthErrorMessage(error) }
  }
}

export async function loginEmailUser({ email, password }) {
  const normalizedEmail = normalizeUserEmail(email)
  const existing = await getUserByEmail(normalizedEmail)

  if (existing?.provider === 'google') {
    return {
      ok: false,
      error: 'This email uses Google sign-in. Continue with Google to log in.',
    }
  }

  try {
    const firebaseUser = await signInWithEmailPassword({
      email: normalizedEmail,
      password,
    })

    const now = new Date().toISOString()
    const record = buildUserRecord({
      email: normalizedEmail,
      firstName: existing?.firstName ?? '',
      lastName: existing?.lastName ?? '',
      displayName: existing?.displayName ?? firebaseUser.displayName ?? '',
      provider: 'email',
      phone: existing?.phone ?? '',
      location: existing?.location ?? '',
      aboutMe: existing?.aboutMe ?? '',
      photoURL: existing?.photoURL ?? '',
      uid: firebaseUser.uid,
      memberSince: existing?.memberSince ?? existing?.createdAt ?? now,
      createdAt: existing?.createdAt ?? now,
      lastLoginAt: now,
    })

    const saved = await saveUserRecord(record)
    return { ok: true, user: toSessionUser(saved) }
  } catch (error) {
    if (existing?.provider === 'email' && existing.password === password) {
      try {
        const displayName = existing.displayName ?? displayNameFromEmail(normalizedEmail)
        const firebaseUser = await registerWithEmailPassword({
          email: normalizedEmail,
          password,
          displayName,
        })

        const now = new Date().toISOString()
        const record = buildUserRecord({
          ...existing,
          email: normalizedEmail,
          provider: 'email',
          uid: firebaseUser.uid,
          lastLoginAt: now,
        })
        const saved = await saveUserRecord(record)
        return { ok: true, user: toSessionUser(saved) }
      } catch (migrationError) {
        if (migrationError?.code === 'auth/email-already-in-use') {
          return {
            ok: false,
            error: 'This account needs a password reset. Please contact support.',
          }
        }
        return { ok: false, error: getAuthErrorMessage(migrationError) }
      }
    }

    if (!existing) {
      return { ok: false, error: 'No account found with this email. Please sign up first.' }
    }

    return { ok: false, error: getAuthErrorMessage(error) }
  }
}

export async function upsertEmailFirebaseUser(firebaseUser) {
  const email = normalizeUserEmail(firebaseUser.email ?? '')
  if (!email) {
    throw new Error('Email account did not return an email address.')
  }

  const existing = await getUserByEmail(email)
  const displayName = firebaseUser.displayName ?? existing?.displayName ?? ''
  const nameParts = displayName.split(/\s+/).filter(Boolean)
  const now = new Date().toISOString()

  const record = buildUserRecord({
    email,
    firstName: existing?.firstName || nameParts[0] || displayNameFromEmail(email),
    lastName: existing?.lastName || nameParts.slice(1).join(' ') || '',
    displayName: existing?.displayName || displayName,
    provider: 'email',
    phone: existing?.phone ?? '',
    location: existing?.location ?? '',
    aboutMe: existing?.aboutMe ?? '',
    photoURL: existing?.photoURL ?? '',
    uid: firebaseUser.uid,
    memberSince: existing?.memberSince ?? existing?.createdAt ?? now,
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
  })

  const saved = await saveUserRecord(record)
  return toSessionUser(saved)
}

export async function upsertGoogleUser(firebaseUser) {
  const email = normalizeUserEmail(firebaseUser.email ?? '')
  if (!email) {
    throw new Error('Google account did not return an email address.')
  }

  const existing = await getUserByEmail(email)
  const displayName = firebaseUser.displayName ?? ''
  const nameParts = displayName.split(/\s+/).filter(Boolean)
  const firstName = existing?.firstName || nameParts[0] || 'Google'
  const lastName = existing?.lastName || nameParts.slice(1).join(' ') || 'User'
  const now = new Date().toISOString()

  const record = buildUserRecord({
    email,
    firstName,
    lastName,
    displayName: existing?.displayName || displayName,
    provider: 'google',
    phone: existing?.phone ?? '',
    location: existing?.location ?? '',
    aboutMe: existing?.aboutMe ?? '',
    photoURL: firebaseUser.photoURL ?? existing?.photoURL ?? '',
    uid: firebaseUser.uid,
    memberSince: existing?.memberSince ?? existing?.createdAt ?? now,
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
  })

  const saved = await saveUserRecord(record)
  return toSessionUser(saved)
}

export async function updateUserProfile(email, updates) {
  const id = getUserDocumentId(email)
  const existing = await getUserByEmail(id)

  if (!existing) {
    return { ok: false, error: 'User profile not found.' }
  }

  const record = buildUserRecord({
    ...existing,
    email: id,
    firstName: updates.firstName ?? existing.firstName,
    lastName: updates.lastName ?? existing.lastName,
    phone: updates.phone ?? existing.phone,
    location: updates.location ?? existing.location,
    aboutMe: updates.aboutMe ?? existing.aboutMe,
    provider: existing.provider,
    photoURL: existing.photoURL ?? '',
    uid: existing.uid ?? '',
    memberSince: existing.memberSince,
    createdAt: existing.createdAt,
    lastLoginAt: existing.lastLoginAt,
    password: existing.password,
  })

  const saved = await saveUserRecord(record)
  return { ok: true, user: toSessionUser(saved) }
}

export async function deleteUserByEmail(email) {
  const userId = getUserDocumentId(email)
  const { deleteUserWishlist } = await import('./wishlist.js')
  const { deleteUserCart } = await import('./cart.js')
  const { deleteUserOrders } = await import('./orders.js')
  const { deleteUserKyc } = await import('./kyc.js')
  const { deleteAdminCatalog } = await import('./adminCatalog.js')
  await deleteUserWishlist(email)
  await deleteUserCart(email)
  await deleteUserOrders(email)
  await deleteUserKyc(email)
  await deleteAdminCatalog(email)
  await removeDocument(COLLECTIONS.users, userId)
}
