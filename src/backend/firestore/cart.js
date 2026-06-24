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
import { buildCartItemSnapshot, buildUserAddress } from './productSnapshots'
import { getUserDocumentId } from './users'

export function getCartDocId(key) {
  return String(key)
}

export function toCartContextItem(record) {
  return {
    key: record.key,
    productId: record.productId,
    title: record.title,
    image: record.image,
    rentalPrice: record.rentalPrice,
    originalPrice: record.originalPrice,
    period: record.period,
    category: record.category,
    quantity: record.quantity ?? 1,
    durationPlanId: record.durationPlanId ?? '1m',
    durationLabel: record.durationLabel ?? '',
    unitPrice: record.unitPrice ?? record.rentalPrice,
  }
}

async function updateCartIndex(userEmail, items) {
  const userId = getUserDocumentId(userEmail)

  await patchDocument(COLLECTIONS.users, userId, {
    cartIndex: {
      count: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
      itemCount: items.length,
      productIds: items.map((item) => String(item.productId)),
      keys: items.map((item) => item.key),
      categories: [...new Set(items.map((item) => item.category).filter(Boolean))],
      updatedAt: new Date().toISOString(),
    },
  })
}

export async function fetchUserCart(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
  )

  return items.map(toCartContextItem)
}

export async function addToUserCart(userEmail, product, user, options = {}) {
  const userId = getUserDocumentId(userEmail)
  const productId = product.id ?? product.productId
  const durationPlanId = options.durationPlanId ?? '1m'
  const key = options.key ?? `${productId}-${durationPlanId}`
  const docId = getCartDocId(key)

  const existingItems = await fetchSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart)
  const existing = existingItems.find((item) => item.key === key) ?? null
  const quantity = Math.max(1, (existing?.quantity ?? 0) + (options.quantity ?? 1))

  const snapshot = buildCartItemSnapshot(product, user, { ...options, key, quantity }, existing)
  await saveSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart, docId, snapshot)

  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
  )
  await updateCartIndex(userEmail, items)

  return toCartContextItem(snapshot)
}

export async function updateUserCartItem(userEmail, key, updates, user) {
  const userId = getUserDocumentId(userEmail)
  const docId = getCartDocId(key)
  const existingItems = await fetchSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart)
  const existing = existingItems.find((item) => item.key === key)

  if (!existing) return null

  const snapshot = buildCartItemSnapshot(
    existing,
    user,
    {
      key,
      quantity: updates.quantity ?? existing.quantity,
      durationPlanId: existing.durationPlanId,
      durationLabel: existing.durationLabel,
      unitPrice: existing.unitPrice,
    },
    existing,
  )

  await saveSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart, docId, snapshot)

  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
  )
  await updateCartIndex(userEmail, items)

  return toCartContextItem(snapshot)
}

export async function removeFromUserCart(userEmail, key) {
  const userId = getUserDocumentId(userEmail)
  await removeSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart, getCartDocId(key))

  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
  )
  await updateCartIndex(userEmail, items)
}

export async function clearUserCart(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart)
  await updateCartIndex(userEmail, [])
}

export async function mergeGuestCart(userEmail, localItems, user) {
  if (!localItems?.length) return fetchUserCart(userEmail)

  for (const item of localItems) {
    await addToUserCart(userEmail, item, user, {
      quantity: item.quantity ?? 1,
      durationPlanId: item.durationPlanId ?? '1m',
      durationLabel: item.durationLabel ?? '',
      unitPrice: item.unitPrice ?? item.rentalPrice,
      key: item.key,
    })
  }

  return fetchUserCart(userEmail)
}

export async function refreshCartAddresses(userEmail, user) {
  const userId = getUserDocumentId(userEmail)
  const items = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
  )

  const address = buildUserAddress(user)
  await Promise.all(
    items.map((item) =>
      saveSubDocument(
        COLLECTIONS.users,
        userId,
        USER_SUBCOLLECTIONS.cart,
        item.id,
        { userAddress: address, updatedAt: new Date().toISOString() },
      ),
    ),
  )
}

export function subscribeToUserCart(userEmail, onData, onError) {
  const userId = getUserDocumentId(userEmail)

  return subscribeToSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.cart,
    [orderBy('updatedAt', 'desc')],
    (items) => onData(items.map(toCartContextItem)),
    onError,
  )
}

export async function deleteUserCart(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.cart)
}
