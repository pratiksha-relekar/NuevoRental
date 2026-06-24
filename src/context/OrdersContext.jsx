import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { placeUserOrder, subscribeToUserOrders } from '../backend/firestore/orders'
import { useAuth } from './AuthContext'
import { SESSION_CACHE_KEYS } from '../utils/sessionCache'

const KYC_STORAGE_KEY = SESSION_CACHE_KEYS.KYC

function isKycApproved(email) {
  try {
    const records = JSON.parse(window.localStorage.getItem(KYC_STORAGE_KEY) ?? '{}')
    return records[email]?.status === 'approved'
  } catch {
    return false
  }
}

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersReady, setOrdersReady] = useState(false)

  const userEmail = user?.email ?? null

  useEffect(() => {
    if (!userEmail) {
      setOrders([])
      setOrdersReady(true)
      return undefined
    }

    let active = true
    setOrdersReady(false)
    setOrders([])

    const unsubscribe = subscribeToUserOrders(
      userEmail,
      (nextOrders) => {
        if (active) {
          setOrders(nextOrders)
          setOrdersReady(true)
        }
      },
      () => {
        if (active) {
          setOrdersReady(true)
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [userEmail])

  const orderCount = orders.length

  const placeOrder = useCallback(
    async ({ items, delivery, payment, summary }) => {
      if (!userEmail || !user) return null

      const kycApproved = isKycApproved(userEmail)

      try {
        return await placeUserOrder(userEmail, user, {
          items,
          delivery,
          payment,
          summary,
          awaitingKyc: !kycApproved,
        })
      } catch {
        return null
      }
    },
    [userEmail, user],
  )

  const value = useMemo(
    () => ({
      orders,
      orderCount,
      ordersReady,
      placeOrder,
    }),
    [orders, orderCount, ordersReady, placeOrder],
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
