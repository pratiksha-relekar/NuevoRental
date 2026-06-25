import { FEATURED_DEALS } from '../../data/featuredDeals'
import { getAdminCatalogUserId } from './adminCatalog'
import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchSubDocument,
  fetchSubcollection,
  removeSubDocument,
  saveSubDocument,
  subscribeToSubcollection,
} from './client'

export const WEEKLY_OFFERS_CONFIG_ID = '_config'
export const WEEKLY_OFFERS_MIRROR_KEY = 'nuevo-rental-weekly-offers'

function saveMirror(payload) {
  try {
    window.localStorage.setItem(WEEKLY_OFFERS_MIRROR_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage errors.
  }
}

function buildDealPayload(deal) {
  const discountPercent = Number(deal.discountPercent) || 0
  const originalPrice = Number(deal.originalPrice) || 0
  const offerPrice = Number(deal.offerPrice) || 0
  const stock = Number(deal.stock) || 0

  return {
    id: deal.id,
    productId: Number(deal.productId) || deal.productId,
    title: deal.title?.trim() ?? '',
    category: deal.category ?? 'laptops',
      image: deal.image?.trim() || deal.imageUrl?.trim() || deal.imageDataUrl?.trim() || '',
      imageUrl: deal.image?.trim() || deal.imageUrl?.trim() || deal.imageDataUrl?.trim() || '',
      imageDataUrl: deal.imageDataUrl?.trim() || (deal.image?.startsWith('data:') ? deal.image : '') || '',
    images: Array.isArray(deal.images) ? deal.images.filter(Boolean) : [],
    brand: deal.brand?.trim() || 'Nuevo Rental',
    rating: Number(deal.rating) || 5,
    reviews: Number(deal.reviews) || 0,
    discountPercent,
    originalPrice,
    offerPrice,
    period: deal.period || 'month',
    stock,
    inStock: deal.inStock !== false && stock > 0,
    active: deal.active !== false,
    sortOrder: Number(deal.sortOrder) || 0,
    source: deal.source || 'admin',
    updatedAt: new Date().toISOString(),
  }
}

function buildConfigPayload(config) {
  return {
    endsAt: config.endsAt || null,
    sectionTitle: config.sectionTitle?.trim() || 'Weekly Best Deals',
    viewAllPath: config.viewAllPath?.trim() || '/pricing',
    updatedAt: new Date().toISOString(),
  }
}

export function mirrorWeeklyOffersToLocalStorage(deals, config) {
  saveMirror({
    deals,
    config,
    updatedAt: new Date().toISOString(),
  })
}

export async function fetchWeeklyOffers(adminUserId = getAdminCatalogUserId()) {
  const items = await fetchSubcollection(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
  )

  const deals = items
    .filter((item) => item.id !== WEEKLY_OFFERS_CONFIG_ID)
    .map((item) => buildDealPayload(item))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))

  const configDoc = items.find((item) => item.id === WEEKLY_OFFERS_CONFIG_ID)
    ?? (await fetchSubDocument(
      COLLECTIONS.users,
      adminUserId,
      USER_SUBCOLLECTIONS.weeklyOffers,
      WEEKLY_OFFERS_CONFIG_ID,
    ))

  const config = buildConfigPayload(configDoc ?? {})
  mirrorWeeklyOffersToLocalStorage(deals, config)
  return { deals, config }
}

export async function saveWeeklyOfferDeal(adminUserId, deal, admin) {
  const payload = buildDealPayload(deal)
  if (!payload.id) {
    throw new Error('Weekly offer id is required.')
  }

  await saveSubDocument(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    payload.id,
    {
      ...payload,
      managedBy: admin?.username ?? 'admin',
      createdAt: deal.createdAt ?? new Date().toISOString(),
    },
  )

  return fetchWeeklyOffers(adminUserId)
}

export async function saveWeeklyOffersConfig(adminUserId, config, admin) {
  const payload = buildConfigPayload(config)

  await saveSubDocument(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    WEEKLY_OFFERS_CONFIG_ID,
    {
      ...payload,
      sortOrder: -999,
      managedBy: admin?.username ?? 'admin',
      createdAt: config.createdAt ?? new Date().toISOString(),
    },
  )

  return fetchWeeklyOffers(adminUserId)
}

export async function deleteWeeklyOfferDeal(adminUserId, dealId) {
  await removeSubDocument(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    dealId,
  )
  return fetchWeeklyOffers(adminUserId)
}

export async function seedWeeklyOffersConfigIfMissing(adminUserId = getAdminCatalogUserId()) {
  const existing = await fetchSubDocument(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    WEEKLY_OFFERS_CONFIG_ID,
  )

  if (existing?.endsAt) return false

  const target = new Date()
  target.setDate(target.getDate() + 3)
  target.setHours(23, 59, 59, 0)

  await saveSubDocument(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    WEEKLY_OFFERS_CONFIG_ID,
    {
      ...buildConfigPayload({
        endsAt: target.toISOString(),
        sectionTitle: 'Weekly Best Deals',
        viewAllPath: '/pricing',
      }),
      sortOrder: -999,
      source: 'seed',
      createdAt: new Date().toISOString(),
    },
  )

  return true
}

export function subscribeToWeeklyOffers(adminUserId, onData, onError) {
  return subscribeToSubcollection(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.weeklyOffers,
    [],
    async (items) => {
      const deals = items
        .filter((item) => item.id !== WEEKLY_OFFERS_CONFIG_ID)
        .map((item) => buildDealPayload(item))
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))

      const configDoc = items.find((item) => item.id === WEEKLY_OFFERS_CONFIG_ID)
      const config = buildConfigPayload(configDoc ?? {})
      mirrorWeeklyOffersToLocalStorage(deals, config)
      onData(deals, config)
    },
    onError,
  )
}

export function getDefaultWeeklyOfferIds() {
  return FEATURED_DEALS.map((deal) => deal.id)
}
