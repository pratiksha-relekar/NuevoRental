import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchSubcollection,
  orderBy,
  patchSubDocument,
  saveDocument,
  saveSubDocument,
  subscribeToSubcollection,
} from './client'

const ADMIN_USER_ID = 'admin'
export const SUPPORT_MIRROR_KEY = 'nuevo-rental-support-requests'

function saveMirror(requests) {
  try {
    window.localStorage.setItem(SUPPORT_MIRROR_KEY, JSON.stringify(requests))
  } catch {
    // Ignore storage errors.
  }
}

function loadMirror() {
  try {
    const raw = window.localStorage.getItem(SUPPORT_MIRROR_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function ensureAdminUserDoc() {
  await saveDocument(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    {
      username: ADMIN_USER_ID,
      displayName: 'Administrator',
      provider: 'admin',
      isAdmin: true,
      role: 'admin',
      updatedAt: new Date().toISOString(),
    },
    true,
  )
}

export function generateSupportRequestId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `SR-${stamp}-${random}`
}

function isUrgentRequest(topic, status) {
  return status === 'open' && (topic === 'support' || topic === 'delivery')
}

export function buildSupportRequestRecord(payload) {
  const now = new Date().toISOString()
  const name = payload.name?.trim() ?? ''
  const email = (payload.email?.trim() ?? '').toLowerCase()
  const phone = payload.phone?.trim() ?? ''
  const topic = payload.topic ?? 'other'
  const status = 'open'

  return {
    id: generateSupportRequestId(),
    name,
    phone,
    email,
    topic,
    message: payload.message?.trim() ?? '',
    status,
    source: payload.source ?? 'contact',
    createdAt: now,
    updatedAt: now,
    adminNotes: '',
    isUrgent: isUrgentRequest(topic, status),
    searchName: name.toLowerCase(),
    searchEmail: email,
    searchPhone: phone.replace(/\D/g, ''),
  }
}

export async function submitSupportRequestToFirestore(payload) {
  await ensureAdminUserDoc()
  const request = buildSupportRequestRecord(payload)

  const saved = await saveSubDocument(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    USER_SUBCOLLECTIONS.support,
    request.id,
    request,
    false,
  )

  const mirror = loadMirror()
  saveMirror([saved, ...mirror.filter((item) => item.id !== saved.id)])
  return saved
}

export async function fetchAdminSupportRequestsFromFirestore() {
  try {
    const items = await fetchSubcollection(
      COLLECTIONS.users,
      ADMIN_USER_ID,
      USER_SUBCOLLECTIONS.support,
      [orderBy('createdAt', 'desc')],
    )
    saveMirror(items)
    return items
  } catch {
    return loadMirror()
  }
}

export function subscribeToAdminSupportRequests(onData, onError) {
  return subscribeToSubcollection(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    USER_SUBCOLLECTIONS.support,
    [orderBy('createdAt', 'desc')],
    (items) => {
      saveMirror(items)
      onData(items)
    },
    onError,
  )
}

export async function updateSupportRequestInFirestore(id, { status, adminNotes } = {}) {
  const existing = loadMirror().find((item) => item.id === id) ?? {}
  const patch = {
    updatedAt: new Date().toISOString(),
  }

  if (status !== undefined) {
    patch.status = status
    patch.isUrgent = isUrgentRequest(existing.topic ?? 'other', status)
  }

  if (adminNotes !== undefined) {
    patch.adminNotes = adminNotes
  }

  await patchSubDocument(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    USER_SUBCOLLECTIONS.support,
    id,
    patch,
  )

  const mirror = loadMirror().map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  )
  saveMirror(mirror)
  return mirror.find((item) => item.id === id) ?? null
}

export function getOpenSupportCountFromMirror() {
  const requests = loadMirror()
  return requests.filter((request) => request.status === 'open').length
}

export async function fetchOpenSupportCountFromFirestore() {
  const requests = await fetchAdminSupportRequestsFromFirestore()
  return requests.filter((request) => request.status === 'open').length
}
