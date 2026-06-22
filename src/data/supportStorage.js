import { COLLECTIONS, saveDocument } from '../backend/firestore'

const SUPPORT_KEY = 'nuevo-rental-support-requests'

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

const DEMO_REQUESTS = [
  {
    id: 'SR-DEMO-001',
    name: 'Aarav Mehta',
    phone: '9876543210',
    email: 'aarav.mehta@example.com',
    topic: 'rental',
    message:
      'I need 3 MacBook Pro units for a 2-week project in Pune. Can you confirm availability and delivery timeline?',
    status: 'open',
    source: 'contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    adminNotes: '',
  },
  {
    id: 'SR-DEMO-002',
    name: 'Priya Sharma',
    phone: '9123456780',
    email: 'priya.sharma@startup.io',
    topic: 'corporate',
    message:
      'Looking for 25 laptops and 10 printers for our Bengaluru office with GST billing and monthly renewal.',
    status: 'in_progress',
    source: 'contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    adminNotes: 'Shared corporate pricing deck. Follow-up call scheduled.',
  },
  {
    id: 'SR-DEMO-003',
    name: 'Rohan Kapoor',
    phone: '9988776655',
    email: 'rohan.k@design.co',
    topic: 'support',
    message:
      'Rented Dell monitor is flickering after 3 days. Need replacement or troubleshooting before client presentation.',
    status: 'open',
    source: 'contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    adminNotes: '',
  },
  {
    id: 'SR-DEMO-004',
    name: 'Neha Desai',
    phone: '9090909090',
    email: 'neha.desai@gmail.com',
    topic: 'billing',
    message: 'Please resend GST invoice for order NR-2025-0142 and confirm security deposit refund timeline.',
    status: 'resolved',
    source: 'contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    adminNotes: 'Invoice emailed. Refund initiated.',
  },
]

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

function generateRequestId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `SR-${stamp}-${random}`
}

function formatPhoneTel(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

function formatWhatsAppLink(phone, message = '') {
  const digits = String(phone ?? '').replace(/\D/g, '')
  const normalized = digits.length === 10 ? `91${digits}` : digits
  const text = encodeURIComponent(message)
  return `https://wa.me/${normalized}${text ? `?text=${text}` : ''}`
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
    whatsappHref: formatWhatsAppLink(
      request.phone,
      `Hi ${request.name}, this is Nuevo Rental support regarding your inquiry (${request.id}).`,
    ),
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

function ensureDemoRequests() {
  const existing = loadJson(SUPPORT_KEY, [])
  if (existing.length > 0) return existing
  saveJson(SUPPORT_KEY, DEMO_REQUESTS)
  return DEMO_REQUESTS
}

export function submitSupportRequest(payload) {
  const requests = loadJson(SUPPORT_KEY, [])
  const now = new Date().toISOString()

  const request = {
    id: generateRequestId(),
    name: payload.name?.trim() ?? '',
    phone: payload.phone?.trim() ?? '',
    email: payload.email?.trim().toLowerCase() ?? '',
    topic: payload.topic ?? 'other',
    message: payload.message?.trim() ?? '',
    status: 'open',
    source: payload.source ?? 'contact',
    createdAt: now,
    updatedAt: now,
    adminNotes: '',
  }

  saveJson(SUPPORT_KEY, [request, ...requests])

  void saveDocument(COLLECTIONS.supportRequests, request.id, request).catch(() => {
    // Keep localStorage flow working if Firestore is unavailable.
  })

  return request
}

export function loadAdminSupportRequests() {
  const requests = ensureDemoRequests()
  const authUsers = loadJson('nuevo-rental-auth-users', {})
  const orders = loadJson('nuevo-rental-orders', {})

  return requests
    .map((request) => enrichRequest(request, authUsers, orders))
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
}

export function getAdminSupportRequestById(id) {
  return loadAdminSupportRequests().find((request) => request.id === id) ?? null
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

export function updateSupportRequestStatus(id, status, adminNotes) {
  const requests = loadJson(SUPPORT_KEY, [])
  const now = new Date().toISOString()

  saveJson(
    SUPPORT_KEY,
    requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
            adminNotes: adminNotes ?? request.adminNotes ?? '',
            updatedAt: now,
          }
        : request,
    ),
  )
}

export function getOpenSupportCount() {
  const requests = loadJson(SUPPORT_KEY, [])
  if (requests.length === 0) {
    return DEMO_REQUESTS.filter((request) => request.status === 'open').length
  }
  return requests.filter((request) => request.status === 'open').length
}
