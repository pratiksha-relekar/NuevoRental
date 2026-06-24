import { getUserByEmail } from '../backend/firestore/users'
import {
  approveUserKycRecord,
  fetchAdminKycUsersFromFirestore,
  fetchKycRecordsByEmail,
  getUserKycRecord,
  KYC_MIRROR_KEY,
  normalizeKycRecord,
  rejectUserKycRecord,
} from '../backend/firestore/kyc'
import { fetchUserOrders } from '../backend/firestore/orders'
import { fetchAllUsers, normalizeUserEmail } from '../backend/firestore/users'
import {
  KYC_STEP_STATUS,
  KYC_STEPS,
  createDefaultKycState,
} from './kycSteps'
import { formatKycStatus } from './userStorage'

const AUTH_USER_KEY = 'nuevo-rental-auth-user'

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
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

function documentIsUploaded(document) {
  if (!document) return false
  return Boolean(document.storageUrl || document.preview || document.dataUrl || document.name)
}

export function getKycDocumentPreview(document) {
  if (!document) return ''
  return document.storageUrl || document.preview || document.dataUrl || ''
}

export function buildKycDetail(kycRecord) {
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
      selfie: record.documents?.selfie ?? null,
      hasAadhaar: documentIsUploaded(record.documents?.aadhaar),
      hasPan: documentIsUploaded(record.documents?.pan),
      hasSelfie: documentIsUploaded(record.documents?.selfie),
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

function resolveKycRecordForUser(profile, kycRecord) {
  if (kycRecord) return kycRecord

  const status = profile.kycStatus ?? profile.kycIndex?.status
  if (!status || status === 'not_started') {
    return null
  }

  return normalizeKycRecord({
    ...createDefaultKycState(),
    status,
    submittedAt: profile.kycIndex?.submittedAt ?? null,
    reviewedAt: profile.kycIndex?.reviewedAt ?? null,
  })
}

function mapProfileToAdminKycUser(email, profile, kycRecord, userOrders, currentSession) {
  const resolvedKycRecord = resolveKycRecordForUser(profile, kycRecord)
  const kyc = buildKycDetail(resolvedKycRecord)
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
    hasDocuments:
      (kyc.documents.hasAadhaar && kyc.documents.hasPan)
      || Boolean(profile.kycIndex?.hasDocuments),
    needsReview: kyc.status === 'in_review',
    canReview:
      kyc.status !== 'approved'
      && (
        kyc.status === 'in_review'
        || kyc.status === 'in_progress'
        || (kyc.documents.hasAadhaar && kyc.documents.hasPan)
        || Boolean(profile.kycIndex?.hasDocuments)
      ),
  }
}

const KYC_SORT_PRIORITY = {
  in_review: 0,
  in_progress: 1,
  rejected: 2,
  not_started: 3,
  approved: 4,
}

function sortAdminKycUsers(users) {
  return [...users].sort((a, b) => {
    const priorityDiff =
      (KYC_SORT_PRIORITY[a.kycStatus] ?? 99) - (KYC_SORT_PRIORITY[b.kycStatus] ?? 99)
    if (priorityDiff !== 0) return priorityDiff
    if (b.pendingOrderCount !== a.pendingOrderCount) {
      return b.pendingOrderCount - a.pendingOrderCount
    }
    return a.displayName.localeCompare(b.displayName)
  })
}

async function buildAdminKycUsersFromRows(rows, currentSession) {
  return Promise.all(
    rows.map(async ({ email, profile, kycRecord }) => {
      const userOrders = await fetchUserOrders(email).catch(() => [])
      return mapProfileToAdminKycUser(email, profile, kycRecord, userOrders, currentSession)
    }),
  )
}

export async function loadAdminKycUserDetail(email) {
  const currentSession = loadJson(AUTH_USER_KEY, null)
  const normalizedEmail = normalizeUserEmail(email)
  const profile = await getUserByEmail(normalizedEmail)
  if (!profile) return null

  const [kycRecord, userOrders] = await Promise.all([
    getUserKycRecord(normalizedEmail).catch(() => null),
    fetchUserOrders(normalizedEmail).catch(() => []),
  ])

  return mapProfileToAdminKycUser(
    normalizedEmail,
    { ...profile, email: normalizedEmail },
    kycRecord,
    userOrders,
    currentSession,
  )
}

export async function loadAdminKycUsers() {
  const currentSession = loadJson(AUTH_USER_KEY, null)

  try {
    const rows = await fetchAdminKycUsersFromFirestore()
    return sortAdminKycUsers(await buildAdminKycUsersFromRows(rows, currentSession))
  } catch {
    const [allUsers, kycByEmail] = await Promise.all([
      fetchAllUsers(),
      fetchKycRecordsByEmail().catch(() => new Map()),
    ])

    const rows = allUsers
      .filter((user) => {
        const email = user.email ?? user.id
        return email && user.provider !== 'admin' && !user.isAdmin
      })
      .map((profile) => {
        const email = normalizeUserEmail(profile.email ?? profile.id)
        return {
          email,
          profile: { ...profile, email },
          kycRecord: kycByEmail.get(email) ?? null,
        }
      })

    return sortAdminKycUsers(await buildAdminKycUsersFromRows(rows, currentSession))
  }
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

export async function getAdminKycUserByEmail(email, users = null) {
  const list = users ?? await loadAdminKycUsers()
  return list.find((user) => user.email === email) ?? null
}

export async function approveUserKyc(email, adminNote = '') {
  await approveUserKycRecord(email, adminNote)
}

export async function rejectUserKyc(email, reason = '') {
  await rejectUserKycRecord(email, reason)
}

export function getPendingKycReviewCount() {
  try {
    const records = JSON.parse(window.localStorage.getItem(KYC_MIRROR_KEY) ?? '{}')
    return Object.values(records).filter((record) => record?.status === 'in_review').length
  } catch {
    return 0
  }
}

export async function fetchPendingKycReviewCount() {
  try {
    const users = await loadAdminKycUsers()
    return users.filter((user) => user.kycStatus === 'in_review').length
  } catch {
    return getPendingKycReviewCount()
  }
}
