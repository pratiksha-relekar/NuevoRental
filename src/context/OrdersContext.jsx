import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './AuthContext'

const ORDERS_STORAGE_KEY = 'nuevo-rental-orders'
const KYC_STORAGE_KEY = 'nuevo-rental-kyc-records'

function isKycApproved(email) {
  try {
    const records = JSON.parse(window.localStorage.getItem(KYC_STORAGE_KEY) ?? '{}')
    return records[email]?.status === 'approved'
  } catch {
    return false
  }
}

const OrdersContext = createContext(null)

function loadAllOrders() {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAllOrders(records) {
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage errors
  }
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NR-${stamp}-${random}`
}

export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const [records, setRecords] = useState(loadAllOrders)

  useEffect(() => {
    saveAllOrders(records)
  }, [records])

  const userEmail = user?.email ?? null

  const orders = useMemo(() => {
    if (!userEmail) return []
    return records[userEmail] ?? []
  }, [records, userEmail])

  const orderCount = orders.length

  const placeOrder = useCallback(
    ({ items, delivery, payment, summary }) => {
      if (!userEmail) return null

      const kycApproved = isKycApproved(userEmail)

      const order = {
        id: generateOrderId(),
        status: kycApproved ? 'confirmed' : 'placed',
        awaitingKyc: !kycApproved,
        placedAt: new Date().toISOString(),
        estimatedDelivery: '2–3 business days',
        items: items.map((item) => ({ ...item })),
        delivery,
        payment,
        summary: { ...summary },
      }

      setRecords((prev) => {
        const current = prev[userEmail] ?? []
        return {
          ...prev,
          [userEmail]: [order, ...current],
        }
      })

      return order
    },
    [userEmail],
  )

  const value = useMemo(
    () => ({
      orders,
      orderCount,
      placeOrder,
    }),
    [orders, orderCount, placeOrder],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}

export const ORDER_STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  returned: 'Returned',
  canceled: 'Canceled',
}

export function getOrderStatusLabel(order) {
  if (order.awaitingKyc && order.status === 'placed') {
    return 'Awaiting KYC approval'
  }
  return ORDER_STATUS_LABELS[order.status] ?? order.status
}
