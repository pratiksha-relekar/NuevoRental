import { FEATURED_DEALS, filterFeaturedDeals } from './featuredDeals'
import { getProductImage } from './products'
import { getCatalogProducts } from './catalogStorage'
import { WEEKLY_OFFERS_MIRROR_KEY } from '../backend/firestore/weeklyOffers'

export { DEAL_FILTERS, filterFeaturedDeals } from './featuredDeals'
export { FEATURED_DEALS as DEFAULT_FEATURED_DEALS } from './featuredDeals'

function loadMirror() {
  try {
    const raw = window.localStorage.getItem(WEEKLY_OFFERS_MIRROR_KEY)
    return raw ? JSON.parse(raw) : { deals: [], config: {} }
  } catch {
    return { deals: [], config: {} }
  }
}

function getDefaultCountdownEndsAt() {
  const target = new Date()
  target.setDate(target.getDate() + 3)
  target.setHours(23, 59, 59, 0)
  return target.toISOString()
}

function isUsableImageSrc(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function resolveDealImage(deal, products) {
  if (isUsableImageSrc(deal.imageDataUrl)) return deal.imageDataUrl
  if (isUsableImageSrc(deal.image)) return deal.image.trim()
  if (isUsableImageSrc(deal.imageUrl)) return deal.imageUrl.trim()

  const product = products.find((item) => Number(item.id) === Number(deal.productId))
  return product ? getProductImage(product) : ''
}

function normalizeDeal(deal, products = []) {
  const stock = Number(deal.stock) || 0
  return {
    ...deal,
    image: resolveDealImage(deal, products),
    productId: Number(deal.productId) || deal.productId,
    inStock: deal.inStock !== false && stock > 0,
    active: deal.active !== false,
  }
}

export function mergeWeeklyOffers(defaultDeals, storedDeals, products = []) {
  const hiddenIds = new Set(
    storedDeals.filter((deal) => deal.active === false).map((deal) => deal.id),
  )
  const overrideMap = new Map(
    storedDeals
      .filter((deal) => deal.active !== false)
      .map((deal) => [deal.id, deal]),
  )

  const merged = defaultDeals
    .filter((deal) => !hiddenIds.has(deal.id))
    .map((deal) => {
      const override = overrideMap.get(deal.id)
      if (override) overrideMap.delete(deal.id)
      return normalizeDeal(override ? { ...deal, ...override } : deal, products)
    })

  overrideMap.forEach((deal) => {
    merged.push(normalizeDeal(deal, products))
  })

  return merged.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
}

export function getWeeklyOffersMirror() {
  return loadMirror()
}

export function getWeeklyOffersConfig() {
  const { config } = loadMirror()
  return {
    endsAt: config?.endsAt || getDefaultCountdownEndsAt(),
    sectionTitle: config?.sectionTitle || 'Weekly Best Deals',
    viewAllPath: config?.viewAllPath || '/pricing',
  }
}

export function getWeeklyOffersCountdownEndsAt() {
  return getWeeklyOffersConfig().endsAt
}

export function loadWeeklyOffersDeals(products = getCatalogProducts()) {
  const { deals: storedDeals } = loadMirror()
  return mergeWeeklyOffers(FEATURED_DEALS, storedDeals, products)
}

export function getDealById(dealId, products = getCatalogProducts()) {
  return loadWeeklyOffersDeals(products).find((deal) => deal.id === dealId) ?? null
}

export function getBestDealForProduct(productId, products = getCatalogProducts()) {
  return loadWeeklyOffersDeals(products)
    .filter((deal) => deal.productId === Number(productId) && deal.inStock)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0] ?? null
}

export function getDealsForProduct(productId, products = getCatalogProducts()) {
  return loadWeeklyOffersDeals(products).filter((deal) => deal.productId === Number(productId))
}

export function getTimeLeft(targetDate) {
  const target = new Date(targetDate)
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}
