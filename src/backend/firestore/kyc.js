import {
  KYC_STEP_STATUS,
  createDefaultKycState,
} from '../../data/kycSteps'
import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchCollectionGroup,
  fetchDocument,
  fetchSubDocument,
  fetchSubcollection,
  orderBy,
  removeSubDocument,
  saveDocument,
  saveSubDocument,
  subscribeToSubDocument,
} from './client'
import { confirmUserOrdersAfterKyc } from './orders'
import { fetchAllUsers, getUserDocumentId, normalizeUserEmail } from './users'
import {
  isDataUrl,
  isRemoteImageUrl,
  resolveKycDocumentsForSave,
} from '../storage/imageStorage'

const KYC_DOC_ID = 'verification'
const ADMIN_USER_ID = 'admin'
const KYC_MIRROR_KEY = 'nuevo-rental-kyc-records'

function saveMirror(records) {
  try {
    window.localStorage.setItem(KYC_MIRROR_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage errors.
  }
}

function loadMirror() {
  try {
    const raw = window.localStorage.getItem(KYC_MIRROR_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function mirrorUserKyc(userEmail, record) {
  const records = loadMirror()
  records[userEmail] = record
  saveMirror(records)
}

function extractUserEmailFromKycPath(refPath = '') {
  const parts = refPath.split('/')
  if (parts[0] === 'users' && parts.length >= 2) {
    return normalizeUserEmail(parts[1])
  }
  return ''
}

function hasUploadedDocument(document) {
  if (!document) return false
  return Boolean(
    document.storageUrl
    || document.dataUrl
    || (isDataUrl(document.preview) ? document.preview : '')
    || (isRemoteImageUrl(document.preview) ? document.preview : '')
    || document.name,
  )
}

export function normalizeKycRecord(record) {
  const base = createDefaultKycState()
  if (!record) return base

  return {
    ...base,
    ...record,
    stepStatuses: {
      ...base.stepStatuses,
      ...(record.stepStatuses ?? {}),
    },
    documents: {
      aadhaar: normalizeDocument(record.documents?.aadhaar),
      pan: normalizeDocument(record.documents?.pan),
      selfie: normalizeDocument(record.documents?.selfie),
    },
    ocrData: record.ocrData ?? null,
  }
}

function normalizeDocument(document) {
  if (!document) return null

  const dataUrl = isDataUrl(document.dataUrl)
    ? document.dataUrl
    : isDataUrl(document.preview)
      ? document.preview
      : ''

  const storageUrl = document.storageUrl && isRemoteImageUrl(document.storageUrl)
    ? document.storageUrl
    : ''

  const preview = dataUrl || storageUrl

  return {
    name: document.name ?? '',
    storageUrl,
    preview,
    dataUrl,
    storagePath: document.storagePath ?? '',
    uploadedAt: document.uploadedAt ?? null,
  }
}

async function updateUserKycIndex(userEmail, record) {
  const userId = getUserDocumentId(userEmail)

  await saveDocument(COLLECTIONS.users, userId, {
    kycIndex: {
      status: record.status ?? 'not_started',
      hasDocuments: hasUploadedDocument(record.documents?.aadhaar)
        && hasUploadedDocument(record.documents?.pan),
      hasSelfie: hasUploadedDocument(record.documents?.selfie),
      submittedAt: record.submittedAt ?? null,
      reviewedAt: record.reviewedAt ?? null,
      verified: record.status === 'approved',
      updatedAt: new Date().toISOString(),
    },
    kycVerified: record.status === 'approved',
    kycStatus: record.status ?? 'not_started',
    updatedAt: new Date().toISOString(),
  }, true)
}

async function ensureAdminUserDoc() {
  await saveDocument(COLLECTIONS.users, ADMIN_USER_ID, {
    username: ADMIN_USER_ID,
    displayName: 'Administrator',
    provider: 'admin',
    isAdmin: true,
    role: 'admin',
    updatedAt: new Date().toISOString(),
  }, true)
}

async function syncAdminKycReview(userEmail, record, profile = null) {
  await ensureAdminUserDoc()
  const userId = getUserDocumentId(userEmail)
  const userDoc = profile ?? await fetchDocument(COLLECTIONS.users, userId)

  const reviewDoc = {
    ...record,
    userEmail,
    email: userEmail,
    displayName: userDoc?.displayName ?? userEmail.split('@')[0],
    phone: userDoc?.phone ?? '',
    location: userDoc?.location ?? '',
    provider: userDoc?.provider ?? 'email',
    memberSince: userDoc?.memberSince ?? null,
    aboutMe: userDoc?.aboutMe ?? '',
    syncedAt: new Date().toISOString(),
  }

  await saveSubDocument(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    USER_SUBCOLLECTIONS.kycReviews,
    userId,
    reviewDoc,
    false,
  )
}

export async function fetchAdminKycReviewRecords() {
  try {
    return await fetchSubcollection(
      COLLECTIONS.users,
      ADMIN_USER_ID,
      USER_SUBCOLLECTIONS.kycReviews,
      [orderBy('updatedAt', 'desc')],
    )
  } catch {
    return fetchSubcollection(
      COLLECTIONS.users,
      ADMIN_USER_ID,
      USER_SUBCOLLECTIONS.kycReviews,
    )
  }
}

export async function getAdminKycReviewRecord(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const record = await fetchSubDocument(
    COLLECTIONS.users,
    ADMIN_USER_ID,
    USER_SUBCOLLECTIONS.kycReviews,
    userId,
  )
  return record ? normalizeKycRecord(record) : null
}

export async function getUserKycRecord(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const record = await fetchSubDocument(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.kyc,
    KYC_DOC_ID,
  )

  if (!record) {
    const adminRecord = await getAdminKycReviewRecord(userEmail)
    return adminRecord
  }

  const normalized = normalizeKycRecord(record)
  mirrorUserKyc(userEmail, normalized)
  return normalized
}

export async function saveUserKycRecord(userEmail, record) {
  const userId = getUserDocumentId(userEmail)
  const now = new Date().toISOString()
  const uploadedDocuments = await resolveKycDocumentsForSave(userEmail, record.documents ?? {})
  const normalized = normalizeKycRecord({
    ...record,
    documents: uploadedDocuments,
    userEmail,
    email: userEmail,
    updatedAt: now,
    createdAt: record.createdAt ?? now,
  })

  await saveSubDocument(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.kyc,
    KYC_DOC_ID,
    normalized,
    false,
  )
  await updateUserKycIndex(userEmail, normalized)
  await syncAdminKycReview(userEmail, normalized)
  mirrorUserKyc(userEmail, normalized)
  return normalized
}

export async function submitUserKycForReview(userEmail, record) {
  const now = new Date().toISOString()
  const base = record ?? (await getUserKycRecord(userEmail)) ?? createDefaultKycState()

  return saveUserKycRecord(userEmail, {
    ...base,
    status: 'in_review',
    activeStepId: 'success',
    stepStatuses: {
      ...base.stepStatuses,
      upload: KYC_STEP_STATUS.DONE,
      ocr: KYC_STEP_STATUS.DONE,
      'face-start': KYC_STEP_STATUS.DONE,
      camera: KYC_STEP_STATUS.DONE,
      'face-match': KYC_STEP_STATUS.DONE,
      success: KYC_STEP_STATUS.DONE,
    },
    submittedAt: base.submittedAt ?? now,
  })
}

export function subscribeToUserKyc(userEmail, onData, onError) {
  const userId = getUserDocumentId(userEmail)

  return subscribeToSubDocument(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.kyc,
    KYC_DOC_ID,
    (record) => {
      if (!record) {
        onData(null)
        return
      }
      const normalized = normalizeKycRecord(record)
      mirrorUserKyc(userEmail, normalized)
      onData(normalized)
    },
    onError,
  )
}

export async function fetchAllKycVerificationDocs() {
  try {
    return await fetchCollectionGroup(USER_SUBCOLLECTIONS.kyc, [orderBy('updatedAt', 'desc')])
  } catch {
    return fetchCollectionGroup(USER_SUBCOLLECTIONS.kyc, [])
  }
}

export async function deleteUserKyc(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.kyc, KYC_DOC_ID)
  await removeSubDocument(COLLECTIONS.users, ADMIN_USER_ID, USER_SUBCOLLECTIONS.kycReviews, userId)

  const records = loadMirror()
  delete records[userEmail]
  saveMirror(records)
}

export async function approveUserKycRecord(userEmail, adminNote = '', reviewedBy = 'admin') {
  const existing = (await getUserKycRecord(userEmail)) ?? createDefaultKycState()
  const now = new Date().toISOString()

  const record = normalizeKycRecord({
    ...existing,
    status: 'approved',
    activeStepId: 'approved',
    stepStatuses: {
      ...existing.stepStatuses,
      success: KYC_STEP_STATUS.DONE,
      approved: KYC_STEP_STATUS.DONE,
    },
    completedAt: existing.completedAt ?? now,
    reviewedAt: now,
    reviewedBy,
    adminNote: adminNote.trim(),
    rejectionReason: '',
    verifiedAt: now,
    verificationNotice: {
      message: 'Your KYC verification is complete. You can now rent any product on Nuevo Rental.',
      read: false,
      approvedAt: now,
    },
  })

  await saveUserKycRecord(userEmail, record)

  try {
    await confirmUserOrdersAfterKyc(userEmail)
  } catch {
    // Orders sync is best-effort; KYC approval still succeeds.
  }

  return record
}

export async function rejectUserKycRecord(userEmail, reason = '', reviewedBy = 'admin') {
  const existing = (await getUserKycRecord(userEmail)) ?? createDefaultKycState()
  const now = new Date().toISOString()

  const record = normalizeKycRecord({
    ...existing,
    status: 'rejected',
    activeStepId: 'upload',
    reviewedAt: now,
    reviewedBy,
    rejectionReason: reason.trim(),
    verificationNotice: {
      message: reason.trim()
        ? `KYC rejected: ${reason.trim()}. Please update your documents and submit again.`
        : 'KYC rejected. Please update your documents and submit again.',
      read: false,
      rejectedAt: now,
    },
  })

  return saveUserKycRecord(userEmail, record)
}

export async function markKycNoticeRead(userEmail) {
  const existing = await getUserKycRecord(userEmail)
  if (!existing?.verificationNotice) return existing ?? createDefaultKycState()

  return saveUserKycRecord(userEmail, {
    ...existing,
    verificationNotice: {
      ...existing.verificationNotice,
      read: true,
    },
  })
}

function isCustomerUser(user) {
  const email = user.email ?? user.id
  return Boolean(email) && user.provider !== 'admin' && !user.isAdmin
}

export async function fetchAdminKycUsersFromFirestore() {
  const [users, adminReviews] = await Promise.all([
    fetchAllUsers(),
    fetchAdminKycReviewRecords().catch(() => []),
  ])

  const reviewByEmail = new Map()
  adminReviews.forEach((review) => {
    const email = normalizeUserEmail(review.userEmail ?? review.email ?? review.id)
    if (email) {
      reviewByEmail.set(email, normalizeKycRecord(review))
    }
  })

  const customerUsers = users.filter(isCustomerUser)

  return Promise.all(
    customerUsers.map(async (profile) => {
      const email = normalizeUserEmail(profile.email ?? profile.id)
      let kycRecord = reviewByEmail.get(email) ?? null

      if (!kycRecord) {
        try {
          kycRecord = await getUserKycRecord(email)
        } catch {
          kycRecord = null
        }
      }

      if (kycRecord && !reviewByEmail.has(email)) {
        try {
          await syncAdminKycReview(email, kycRecord, profile)
        } catch {
          // Best-effort backfill for admin queue.
        }
      }

      return {
        email,
        profile: { ...profile, email },
        kycRecord,
      }
    }),
  )
}

export async function fetchKycRecordsByEmail() {
  const kycDocs = await fetchAllKycVerificationDocs()
  const kycByEmail = new Map()

  kycDocs.forEach((doc) => {
    const email = normalizeUserEmail(
      doc.userEmail ?? doc.email ?? extractUserEmailFromKycPath(doc._refPath),
    )
    if (email) {
      kycByEmail.set(email, normalizeKycRecord(doc))
    }
  })

  return kycByEmail
}

export function loadKycMirrorForUser(userEmail) {
  const records = loadMirror()
  const record = records[userEmail]
  return record ? normalizeKycRecord(record) : null
}

export { KYC_DOC_ID, KYC_MIRROR_KEY }
