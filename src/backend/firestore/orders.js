import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchSubcollection,
  orderBy,
  patchDocument,
  patchSubDocument,
  removeSubcollection,
  removeSubDocument,
  saveSubDocument,
  subscribeToSubcollection,
} from './client'
import { buildOrderItemSnapshot, buildUserAddress } from './productSnapshots'
import { getUserDocumentId } from './users'

const ORDERS_STORAGE_KEY = 'nuevo-rental-orders'

export function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NR-${stamp}-${random}`
}

function mirrorOrdersToLocalStorage(userEmail, orders) {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    const records = raw ? JSON.parse(raw) : {}
    records[userEmail] = orders
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage errors.
  }
}

async function updateOrdersIndex(userEmail, orders) {
  const userId = getUserDocumentId(userEmail)

  await patchDocument(COLLECTIONS.users, userId, {
    ordersIndex: {
      count: orders.length,
      orderIds: orders.map((order) => order.id),
      statuses: [...new Set(orders.map((order) => order.status).filter(Boolean))],
      pendingKycCount: orders.filter((order) => order.awaitingKyc).length,
      updatedAt: new Date().toISOString(),
    },
  })
}

export function toOrderContextItem(record) {
  return {
    id: record.id,
    status: record.status,
    awaitingKyc: Boolean(record.awaitingKyc),
    placedAt: record.placedAt,
    updatedAt: record.updatedAt ?? record.placedAt,
    estimatedDelivery: record.estimatedDelivery ?? '2–3 business days',
    items: record.items ?? [],
    delivery: record.delivery ?? {},
    payment: record.payment ?? {},
    summary: record.summary ?? {},
    userAddress: record.userAddress ?? null,
    kycApprovedAt: record.kycApprovedAt ?? null,
  }
}

export async function fetchUserOrders(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const orders = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.orders,
    [orderBy('placedAt', 'desc')],
  )

  const mapped = orders.map(toOrderContextItem)
  mirrorOrdersToLocalStorage(userEmail, mapped)
  return mapped
}

export async function placeUserOrder(userEmail, user, { items, delivery, payment, summary, awaitingKyc }) {
  const userId = getUserDocumentId(userEmail)
  const now = new Date().toISOString()
  const orderId = generateOrderId()

  const orderRecord = {
    id: orderId,
    status: awaitingKyc ? 'placed' : 'confirmed',
    awaitingKyc: Boolean(awaitingKyc),
    placedAt: now,
    updatedAt: now,
    estimatedDelivery: '2–3 business days',
    items: items.map((item) => buildOrderItemSnapshot(item, user)),
    delivery: { ...delivery },
    payment: { ...payment },
    summary: { ...summary },
    userAddress: buildUserAddress(user, delivery),
  }

  await saveSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.orders, orderId, orderRecord)

  const orders = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.orders,
    [orderBy('placedAt', 'desc')],
  )
  const mapped = orders.map(toOrderContextItem)
  await updateOrdersIndex(userEmail, mapped)
  mirrorOrdersToLocalStorage(userEmail, mapped)

  return toOrderContextItem(orderRecord)
}

export async function updateUserOrder(userEmail, orderId, updates) {
  const userId = getUserDocumentId(userEmail)
  const now = new Date().toISOString()

  await patchSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.orders, orderId, {
    ...updates,
    updatedAt: now,
  })

  const orders = await fetchUserOrders(userEmail)
  await updateOrdersIndex(userEmail, orders)
  return orders.find((order) => order.id === orderId) ?? null
}

export async function confirmUserOrdersAfterKyc(userEmail) {
  const userId = getUserDocumentId(userEmail)
  const orders = await fetchSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.orders,
    [orderBy('placedAt', 'desc')],
  )
  const now = new Date().toISOString()

  await Promise.all(
    orders
      .filter((order) => order.status !== 'canceled' && (order.awaitingKyc || order.status === 'placed'))
      .map((order) =>
        patchSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.orders, order.id, {
          awaitingKyc: false,
          status: 'confirmed',
          kycApprovedAt: now,
          updatedAt: now,
        }),
      ),
  )

  return fetchUserOrders(userEmail)
}

export async function deleteUserOrder(userEmail, orderId) {
  const userId = getUserDocumentId(userEmail)
  await removeSubDocument(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.orders, orderId)

  const orders = await fetchUserOrders(userEmail)
  await updateOrdersIndex(userEmail, orders)
}

export async function deleteUserOrders(userEmail) {
  const userId = getUserDocumentId(userEmail)
  await removeSubcollection(COLLECTIONS.users, userId, USER_SUBCOLLECTIONS.orders)
  mirrorOrdersToLocalStorage(userEmail, [])
  await updateOrdersIndex(userEmail, [])
}

export function subscribeToUserOrders(userEmail, onData, onError) {
  const userId = getUserDocumentId(userEmail)

  return subscribeToSubcollection(
    COLLECTIONS.users,
    userId,
    USER_SUBCOLLECTIONS.orders,
    [orderBy('placedAt', 'desc')],
    (records) => {
      const orders = records.map(toOrderContextItem)
      mirrorOrdersToLocalStorage(userEmail, orders)
      onData(orders)
    },
    onError,
  )
}
