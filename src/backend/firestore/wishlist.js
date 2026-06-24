import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchSubcollection,
  orderBy,
  patchDocument,
  removeSubcollection,
  removeSubDocument,
  saveSubDocument,
  subscribeToSubcollection,
} from './client'
import { buildProductSnapshot, buildUserAddress } from './productSnapshots'
import { getUserDocumentId } from './users'

export function buildWishlistProductSnapshot(product, user = null, existing = null) {
  return buildProductSnapshot(product, user, existing)
}

export function toWishlistContextItem(record) {
  return {
    productId: record.productId,
    title: record.title,
    image: record.image,
    rentalPrice: record.rentalPrice,
    originalPrice: record.originalPrice,
    period: record.period,
    category: record.category,
    categoryLabel: record.categoryLabel,
    brand: record.brand,
    description: record.description,
    specifications: record.specifications,
    durationPlans: record.durationPlans,
    stock: record.stock,
    rating: record.rating,
    reviewCount: record.reviewCount,
    tags: record.tags,
    userAddress: record.userAddress,
    addedAt: record.addedAt ? new Date(record.addedAt).getTime() : Date.now(),
  }
}

function getWishlistDocId(productId) {
  return String(productId)
}

async function updateWishlistIndex(userEmail, items) {
  const userId = getUserDocumentId(userEmail)

  await patchDocument(COLLECTIONS.users, userId, {
    wishlistIndex: {
      count: items.length,
      productIds: items.map((item) => String(item.productId)),
      categories: [...new Set(items.map((item) => item.category).filter(Boolean))],
      updatedAt: new Date().toISOString(),
    },
  })
}

export async function fetchUserWishlist(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.wishlist,
    [orderBy('addedAt', 'desc')],
  )

  return items.map(toWishlistContextItem)
}

export async function addToUserWishlist(userEmail, product, user) {
  const userId = getUserDocumentId(userEmail)
  const productId = product.id ?? product.productId
  const docId = getWishlistDocId(productId)
  const existing = await fetchSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.wishlist)
    .then((items) => items.find((item) => String(item.productId) === String(productId)) ?? null)

  const snapshot = buildWishlistProductSnapshot(product, user, existing)
  await saveSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.wishlist, docId, snapshot)

  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.wishlist,
    [orderBy('addedAt', 'desc')],
  )
  await updateWishlistIndex(userEmail, items)

  return toWishlistContextItem(snapshot)
}

export async function removeFromUserWishlist(userEmail, productId) {
  const userId = getUserDocumentId(userEmail)
  const docId = getWishlistDocId(productId)

  await removeSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.wishlist, docId)

  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.wishlist,
    [orderBy('addedAt', 'desc')],
  )
  await updateWishlistIndex(userEmail, items)
}

export async function clearUserWishlist(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.wishlist)
  await updateWishlistIndex(userEmail, [])
}

export async function mergeGuestWishlist(userEmail, localItems, user) {
  if (!localItems?.length) return fetchUserWishlist(userEmail)

  for (const item of localItems) {
    await addToUserWishlist(userEmail, item, user)
  }

  return fetchUserWishlist(userEmail)
}

export async function refreshWishlistAddresses(userEmail, user) {
  const userId = getUserDocumentId(userEmail)
  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.wishlist,
    [orderBy('addedAt', 'desc')],
  )

  const address = buildUserAddress(user)
  await Promise.all(
    items.map((item) =>
      saveSubDocument(
        COLLECTIONS.users,
        userId,
        USER_SUBCOLLECTIONS.wishlist,
        item.id,
        { userAddress: address, updatedAt: new Date().toISOString() },
      ),
    ),
  )
}

export function subscribeToUserWishlist(userEmail, onData, onError) {
  const userId = getUserDocumentId(userEmail)

  return subscribeToSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.wishlist,
    [orderBy('addedAt', 'desc')],
    (items) => onData(items.map(toWishlistContextItem)),
    onError,
  )
}

export async function deleteUserWishlist(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.wishlist)
}
