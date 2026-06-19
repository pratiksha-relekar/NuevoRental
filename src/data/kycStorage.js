import {
  KYC_STEP_STATUS,
  KYC_STEPS,
  createDefaultKycState,
} from './kycSteps'
import { formatKycStatus } from './userStorage'

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

function formatDate(isoDate, withTime = false) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

function buildKycDetail(kycRecord) {
  const record = kycRecord ?? createDefaultKycState()
  const stepStatuses = record.stepStatuses ?? {}
  const completedSteps = KYC_STEPS.filter(
    (step) => stepStatuses[step.id] === KYC_STEP_STATUS.DONE,
  ).length

  return {
    status: record.status ?? 'not_started',
    statusLabel: formatKycStatus(record.status ?? 'not_started'),
    activeStepId: record.activeStepId ?? 'upload',
    progressPercent: Math.round((completedSteps / KYC_STEPS.length) * 100),
    completedSteps,
    totalSteps: KYC_STEPS.length,
    steps: KYC_STEPS.map((step) => ({
      id: step.id,
      label: step.label,
      description: step.description,
      status: stepStatuses[step.id] ?? KYC_STEP_STATUS.PENDING,
    })),
    documents: {
      aadhaar: record.documents?.aadhaar ?? null,
      pan: record.documents?.pan ?? null,
      hasAadhaar: Boolean(record.documents?.aadhaar),
      hasPan: Boolean(record.documents?.pan),
    },
    ocrData: record.ocrData ?? null,
    submittedAt: record.submittedAt ?? null,
    submittedLabel: formatDate(record.submittedAt, true),
    completedAt: record.completedAt ?? null,
    completedLabel: formatDate(record.completedAt),
    reviewedAt: record.reviewedAt ?? null,
    reviewedLabel: formatDate(record.reviewedAt, true),
    rejectionReason: record.rejectionReason ?? '',
    adminNote: record.adminNote ?? '',
  }
}

function mapUserOrders(userOrders) {
  return userOrders.map((order) => {
    const items = order.items ?? []
    const firstItem = items[0]

    return {
      id: order.id,
      status: order.status,
      awaitingKyc: Boolean(order.awaitingKyc),
      placedAt: order.placedAt,
      placedLabel: formatDate(order.placedAt, true),
      payAmount: order.summary?.payAmount ?? 0,
      itemCount: items.length,
      firstItemTitle: firstItem?.title ?? firstItem?.name ?? 'Rental item',
      items: items.map((item) => ({
        id: item.id,
        title: item.title ?? item.name,
        quantity: item.quantity ?? 1,
        rentalPrice: item.rentalPrice ?? item.unitPrice ?? 0,
        durationLabel: item.durationLabel ?? '',
        image: item.image ?? null,
      })),
      deliveryCity: order.delivery?.city ?? '—',
      scheduleLabel: order.delivery?.deliveryDate
        ? `${order.delivery.deliveryDate}${order.delivery.deliverySlot ? `, ${order.delivery.deliverySlot}` : ''}`
        : order.estimatedDelivery ?? '—',
    }
  })
}

const KYC_SORT_PRIORITY = {
  in_review: 0,
  in_progress: 1,
  rejected: 2,
  not_started: 3,
  approved: 4,
}

export function loadAdminKycUsers() {
  const users = loadJson(AUTH_USERS_KEY, {})
  const kycRecords = loadJson(KYC_KEY, {})
  const orders = loadJson(ORDERS_KEY, {})
  const currentSession = loadJson(AUTH_USER_KEY, null)

  return Object.entries(users)
    .map(([email, profile]) => {
      const kycRecord = kycRecords[email] ?? null
      const kyc = buildKycDetail(kycRecord)
      const userOrders = Array.isArray(orders[email]) ? orders[email] : []
      const mappedOrders = mapUserOrders(userOrders)
      const pendingOrders = mappedOrders.filter(
        (order) => order.awaitingKyc || order.status === 'placed',
      )

      return {
        email,
        displayName: profile.displayName || email.split('@')[0],
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        provider: profile.provider ?? 'email',
        memberSince: profile.memberSince ?? null,
        joinedLabel: formatDate(profile.memberSince),
        aboutMe: profile.aboutMe ?? '',
        isOnline: currentSession?.email === email,
        initials: getInitials(profile.displayName, email),
        kycStatus: kyc.status,
        kycStatusLabel: kyc.statusLabel,
        kyc,
        orderCount: userOrders.length,
        pendingOrderCount: pendingOrders.length,
        orders: mappedOrders,
        pendingOrders,
        hasDocuments: kyc.documents.hasAadhaar && kyc.documents.hasPan,
        needsReview: kyc.status === 'in_review',
      }
    })
    .sort((a, b) => {
      const priorityDiff =
        (KYC_SORT_PRIORITY[a.kycStatus] ?? 99) - (KYC_SORT_PRIORITY[b.kycStatus] ?? 99)
      if (priorityDiff !== 0) return priorityDiff
      if (b.pendingOrderCount !== a.pendingOrderCount) {
        return b.pendingOrderCount - a.pendingOrderCount
      }
      return a.displayName.localeCompare(b.displayName)
    })
}

export function getAdminKycStats(users) {
  return {
    total: users.length,
    awaitingReview: users.filter((user) => user.kycStatus === 'in_review').length,
    verified: users.filter((user) => user.kycStatus === 'approved').length,
    rejected: users.filter((user) => user.kycStatus === 'rejected').length,
    inProgress: users.filter((user) => user.kycStatus === 'in_progress').length,
    notStarted: users.filter((user) => user.kycStatus === 'not_started').length,
    withPendingOrders: users.filter((user) => user.pendingOrderCount > 0).length,
  }
}

export function getAdminKycUserByEmail(email) {
  return loadAdminKycUsers().find((user) => user.email === email) ?? null
}

export function approveUserKyc(email, adminNote = '') {
  const kycRecords = loadJson(KYC_KEY, {})
  const record = kycRecords[email] ?? createDefaultKycState()
  const now = new Date().toISOString()

  kycRecords[email] = {
    ...record,
    status: 'approved',
    activeStepId: 'approved',
    stepStatuses: {
      ...record.stepStatuses,
      success: KYC_STEP_STATUS.DONE,
      approved: KYC_STEP_STATUS.DONE,
    },
    completedAt: record.completedAt ?? now,
    reviewedAt: now,
    reviewedBy: 'admin',
    adminNote,
    rejectionReason: '',
  }
  saveJson(KYC_KEY, kycRecords)

  const orders = loadJson(ORDERS_KEY, {})
  const userOrders = orders[email] ?? []

  orders[email] = userOrders.map((order) => {
    if (order.status === 'canceled') return order
    if (!order.awaitingKyc && order.status !== 'placed') return order

    return {
      ...order,
      awaitingKyc: false,
      status: 'confirmed',
      kycApprovedAt: now,
      updatedAt: now,
    }
  })
  saveJson(ORDERS_KEY, orders)
}

export function rejectUserKyc(email, reason = '') {
  const kycRecords = loadJson(KYC_KEY, {})
  const record = kycRecords[email] ?? createDefaultKycState()
  const now = new Date().toISOString()

  kycRecords[email] = {
    ...record,
    status: 'rejected',
    reviewedAt: now,
    reviewedBy: 'admin',
    rejectionReason: reason.trim(),
  }
  saveJson(KYC_KEY, kycRecords)
}

export function getPendingKycReviewCount() {
  const records = loadJson(KYC_KEY, {})
  return Object.values(records).filter((record) => record?.status === 'in_review').length
}
