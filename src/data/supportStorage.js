import {
  fetchAdminSupportRequestsFromFirestore,
  fetchOpenSupportCountFromFirestore,
  getOpenSupportCountFromMirror,
  submitSupportRequestToFirestore,
  subscribeToAdminSupportRequests,
  SUPPORT_MIRROR_KEY,
  updateSupportRequestInFirestore,
} from '../backend/firestore/support'
import { SESSION_CACHE_KEYS } from '../utils/sessionCache'

const SUPPORT_KEY = SUPPORT_MIRROR_KEY
const AUTH_USERS_KEY = SESSION_CACHE_KEYS.AUTH_USERS
const ORDERS_KEY = SESSION_CACHE_KEYS.ORDERS

export { SUPPORT_MIRROR_KEY }

export const SUPPORT_TOPIC_LABELS = {
  rental: 'Product Rental',
  corporate: 'Corporate / Bulk Order',
  delivery: 'Delivery & Setup',
  support: 'Technical Support',
  billing: 'Billing & Invoice',
  other: 'Other',
}

export const SUPPORT_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const SUPPORT_STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function formatPhoneTel(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

function getInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

function enrichRequest(request, authUsers, orders) {
  const emailKey = request.email?.toLowerCase() ?? ''
  const profile = authUsers[emailKey] ?? authUsers[request.email] ?? null
  const userOrders = orders[emailKey] ?? orders[request.email] ?? []
  const orderList = Array.isArray(userOrders) ? userOrders : []

  return {
    ...request,
    topicLabel: SUPPORT_TOPIC_LABELS[request.topic] ?? request.topic,
    statusLabel: SUPPORT_STATUS_LABELS[request.status] ?? request.status,
    createdLabel: request.createdAt
      ? new Date(request.createdAt).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—',
    updatedLabel: request.updatedAt
      ? new Date(request.updatedAt).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—',
    telHref: formatPhoneTel(request.phone) ? `tel:${formatPhoneTel(request.phone)}` : null,
    mailHref: request.email ? `mailto:${request.email}` : null,
    initials: getInitials(request.name),
    isRegisteredUser: Boolean(profile),
    registeredName: profile?.displayName ?? null,
    userOrderCount: orderList.length,
    messagePreview:
      request.message?.length > 120
        ? `${request.message.slice(0, 120)}…`
        : request.message ?? '',
  }
}

function enrichRequests(requests) {
  const authUsers = loadJson(AUTH_USERS_KEY, {})
  const orders = loadJson(ORDERS_KEY, {})

  return requests
    .map((request) => enrichRequest(request, authUsers, orders))
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
}

export async function submitSupportRequest(payload) {
  const request = await submitSupportRequestToFirestore(payload)
  return request
}

export function loadAdminSupportRequests() {
  const requests = loadJson(SUPPORT_KEY, [])
  return enrichRequests(requests)
}

export async function fetchAdminSupportRequests() {
  const requests = await fetchAdminSupportRequestsFromFirestore()
  return enrichRequests(requests)
}

export function subscribeToAdminSupportQueue(onData, onError) {
  return subscribeToAdminSupportRequests(
    (requests) => onData(enrichRequests(requests)),
    onError,
  )
}

export function getAdminSupportRequestById(id, requests = loadAdminSupportRequests()) {
  return requests.find((request) => request.id === id) ?? null
}

export function getAdminSupportStats(requests) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const resolvedToday = requests.filter((request) => {
    if (request.status !== 'resolved' && request.status !== 'closed') return false
    return new Date(request.updatedAt ?? 0) >= today
  }).length

  return {
    total: requests.length,
    open: requests.filter((request) => request.status === 'open').length,
    inProgress: requests.filter((request) => request.status === 'in_progress').length,
    resolved: requests.filter(
      (request) => request.status === 'resolved' || request.status === 'closed',
    ).length,
    resolvedToday,
    urgent: requests.filter(
      (request) =>
        request.status === 'open' &&
        (request.topic === 'support' || request.topic === 'delivery'),
    ).length,
  }
}

export async function updateSupportRequestStatus(id, status, adminNotes) {
  await updateSupportRequestInFirestore(id, { status, adminNotes })
}

export function getOpenSupportCount() {
  return getOpenSupportCountFromMirror()
}

export async function fetchOpenSupportCount() {
  return fetchOpenSupportCountFromFirestore()
}
