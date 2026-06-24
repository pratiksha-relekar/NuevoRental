import { deleteUserOrder, fetchUserOrders, updateUserOrder } from '../backend/firestore/orders'
import { KYC_STEPS } from './kycSteps'
import { formatKycStatus } from './userStorage'
import { SESSION_CACHE_KEYS } from '../utils/sessionCache'

const ORDERS_KEY = SESSION_CACHE_KEYS.ORDERS
const USERS_KEY = SESSION_CACHE_KEYS.AUTH_USERS
const KYC_KEY = SESSION_CACHE_KEYS.KYC
const AUTH_USER_KEY = SESSION_CACHE_KEYS.AUTH_USER

export const ADMIN_ORDER_STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Scheduled',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  canceled: 'Canceled',
  returned: 'Returned',
}

export const ADMIN_ORDER_STATUS_OPTIONS = [
  'placed',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'canceled',
  'returned',
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

function startOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function getOrderAdminBucket(order) {
  if (order.status === 'canceled') return 'canceled'
  if (order.status === 'delivered' || order.status === 'returned') return 'delivered'
  if (order.status === 'out_for_delivery') return 'delivery'

  if (order.placedAt && isSameDay(new Date(order.placedAt), new Date())) {
    return 'today'
  }

  if (order.status === 'placed' || order.status === 'confirmed') {
    return 'scheduled'
  }

  return 'scheduled'
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

function buildKycContext(kycRecord) {
  const stepStatuses = kycRecord?.stepStatuses ?? {}
  const completedSteps = KYC_STEPS.filter(
    (step) => stepStatuses[step.id] === 'done',
  ).length

  return {
    status: kycRecord?.status ?? 'not_started',
    statusLabel: formatKycStatus(kycRecord?.status ?? 'not_started'),
    activeStepId: kycRecord?.activeStepId ?? 'upload',
    activeStepLabel:
      KYC_STEPS.find((step) => step.id === kycRecord?.activeStepId)?.label ?? 'Upload Aadhaar/PAN',
    completedSteps,
    totalSteps: KYC_STEPS.length,
    progressPercent: Math.round((completedSteps / KYC_STEPS.length) * 100),
    stepStatuses,
    steps: KYC_STEPS.map((step) => ({
      id: step.id,
      label: step.label,
      description: step.description,
      status: stepStatuses[step.id] ?? 'pending',
    })),
    ocrData: kycRecord?.ocrData ?? null,
    documents: {
      aadhaar: Boolean(kycRecord?.documents?.aadhaar),
      pan: Boolean(kycRecord?.documents?.pan),
    },
    completedAt: kycRecord?.completedAt ?? null,
    completedLabel: kycRecord?.completedAt
      ? new Date(kycRecord.completedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null,
  }
}

function buildCustomerContext(userEmail, profile, kycRecord, currentSession, userOrderCount) {
  const displayName = profile.displayName || userEmail.split('@')[0]

  return {
    email: userEmail,
    displayName,
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    location: profile.location ?? '',
    aboutMe: profile.aboutMe ?? '',
    provider: profile.provider ?? 'email',
    memberSince: profile.memberSince ?? null,
    joinedLabel: profile.memberSince
      ? new Date(profile.memberSince).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—',
    isOnline: currentSession?.email === userEmail,
    initials: getInitials(displayName, userEmail),
    totalOrders: userOrderCount,
    kyc: buildKycContext(kycRecord),
  }
}

export function loadAdminOrders() {
  const records = loadJson(ORDERS_KEY, {})
  const users = loadJson(USERS_KEY, {})
  const kycRecords = loadJson(KYC_KEY, {})
  const currentSession = loadJson(AUTH_USER_KEY, null)

  return Object.entries(records).flatMap(([userEmail, orders]) => {
    if (!users[userEmail]) return []

    const profile = users[userEmail] ?? {}
    const kycRecord = kycRecords[userEmail] ?? null
    const userOrders = Array.isArray(orders) ? orders : []
    const customer = buildCustomerContext(
      userEmail,
      profile,
      kycRecord,
      currentSession,
      userOrders.length,
    )

    return userOrders.map((order) => {
      const itemCount = order.items?.length ?? 0
      const firstItem = order.items?.[0]
      const summary = order.summary ?? {}

      return {
        ...order,
        userEmail,
        customer,
        customerName: order.delivery?.fullName || customer.displayName,
        customerPhone: order.delivery?.phone || customer.phone || '',
        itemCount,
        firstItemTitle: firstItem?.title ?? firstItem?.name ?? 'Rental item',
        payAmount: summary.payAmount ?? 0,
        deliveryCity: order.delivery?.city ?? '—',
        deliveryDate: order.delivery?.deliveryDate ?? '',
        deliverySlot: order.delivery?.deliverySlot ?? '',
        paymentMethod: order.payment?.method ?? 'cod',
        paymentStatus: order.payment?.status ?? 'pending',
        awaitingKyc: Boolean(order.awaitingKyc),
        kycStatus: customer.kyc.status,
        kycStatusLabel: customer.kyc.statusLabel,
        isCustomerOnline: customer.isOnline,
        provider: customer.provider,
        summaryBreakdown: {
          totalMrp: summary.totalMrp ?? 0,
          rentalDiscount: summary.rentalDiscount ?? 0,
          nuevoOfferDiscount: summary.nuevoOfferDiscount ?? 0,
          bulkBonusDiscount: summary.bulkBonusDiscount ?? 0,
          totalSavings: summary.totalSavings ?? 0,
          securityDeposit: summary.securityDeposit ?? 0,
          payAmount: summary.payAmount ?? 0,
        },
        bucket: getOrderAdminBucket(order),
        placedLabel: order.placedAt
          ? new Date(order.placedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : '—',
        scheduleLabel: order.delivery?.deliveryDate
          ? `${order.delivery.deliveryDate}${order.delivery.deliverySlot ? `, ${order.delivery.deliverySlot}` : ''}`
          : order.estimatedDelivery ?? '—',
      }
    })
  }).sort((a, b) => new Date(b.placedAt ?? 0) - new Date(a.placedAt ?? 0))
}

export async function fetchAdminOrders(users = null) {
  const resolvedUsers = users ?? await (await import('./userStorage')).fetchAdminUsers()
  const ordersMirror = {}

  await Promise.all(
    resolvedUsers.map(async (user) => {
      try {
        ordersMirror[user.email] = await fetchUserOrders(user.email)
      } catch {
        ordersMirror[user.email] = []
      }
    }),
  )

  saveJson(ORDERS_KEY, ordersMirror)
  return loadAdminOrders()
}

export function getAdminOrderById(userEmail, orderId) {
  return loadAdminOrders().find(
    (order) => order.userEmail === userEmail && order.id === orderId,
  )
}

export function getAdminOrderStats(orders) {
  const buckets = orders.reduce(
    (acc, order) => {
      acc[order.bucket] = (acc[order.bucket] ?? 0) + 1
      return acc
    },
    {},
  )

  return {
    total: orders.length,
    today: buckets.today ?? 0,
    scheduled: buckets.scheduled ?? 0,
    delivery: buckets.delivery ?? 0,
    delivered: buckets.delivered ?? 0,
    canceled: buckets.canceled ?? 0,
    kycVerified: orders.filter((order) => order.kycStatus === 'approved').length,
    revenue: orders.reduce((sum, order) => sum + (order.payAmount ?? 0), 0),
  }
}

export function updateAdminOrderStatus(userEmail, orderId, status) {
  const records = loadJson(ORDERS_KEY, {})
  const list = records[userEmail] ?? []

  records[userEmail] = list.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        }
      : order,
  )

  saveJson(ORDERS_KEY, records)

  updateUserOrder(userEmail, orderId, { status }).catch(() => {})
}

export function deleteAdminOrder(userEmail, orderId) {
  const records = loadJson(ORDERS_KEY, {})
  records[userEmail] = (records[userEmail] ?? []).filter((order) => order.id !== orderId)
  saveJson(ORDERS_KEY, records)

  deleteUserOrder(userEmail, orderId).catch(() => {})
}
