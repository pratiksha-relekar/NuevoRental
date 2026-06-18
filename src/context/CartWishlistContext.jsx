import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getProductImage } from '../data/products'
import { getRentalDurationPlans } from '../data/productDetails'

const CART_STORAGE_KEY = 'nuevo-rental-cart'
const WISHLIST_STORAGE_KEY = 'nuevo-rental-wishlist'

const CartWishlistContext = createContext(null)

function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private mode errors
  }
}

function getDefaultPlan(product) {
  const plans = getRentalDurationPlans(product)
  return plans.find((plan) => plan.id === '1m') ?? plans[0]
}

function buildCartKey(productId, durationPlanId) {
  return `${productId}-${durationPlanId}`
}

function snapshotProduct(product) {
  const productId = product.id ?? product.productId
  return {
    productId,
    title: product.title,
    image: getProductImage(product),
    rentalPrice: product.rentalPrice,
    originalPrice: product.originalPrice ?? product.rentalPrice,
    period: product.period,
    category: product.category,
  }
}

export function CartWishlistProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadFromStorage(CART_STORAGE_KEY, []))
  const [wishlistItems, setWishlistItems] = useState(() => loadFromStorage(WISHLIST_STORAGE_KEY, []))

  useEffect(() => {
    saveToStorage(CART_STORAGE_KEY, cartItems)
  }, [cartItems])

  useEffect(() => {
    saveToStorage(WISHLIST_STORAGE_KEY, wishlistItems)
  }, [wishlistItems])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const wishlistCount = wishlistItems.length

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cartItems],
  )

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some((item) => item.productId === productId),
    [wishlistItems],
  )

  const isInCart = useCallback(
    (productId, durationPlanId = '1m') =>
      cartItems.some((item) => item.key === buildCartKey(productId, durationPlanId)),
    [cartItems],
  )

  const addToCart = useCallback((product, options = {}) => {
    const productId = product.id ?? product.productId
    const quantity = Math.max(1, options.quantity ?? 1)
    const plan = options.durationPlan
      ?? getRentalDurationPlans(product).find((item) => item.id === (options.durationPlanId ?? '1m'))
      ?? getDefaultPlan(product)

    const durationPlanId = plan.id
    const key = buildCartKey(productId, durationPlanId)
    const snapshot = snapshotProduct(product)

    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key)

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...prev,
        {
          key,
          ...snapshot,
          quantity,
          durationPlanId,
          durationLabel: plan.shortLabel,
          unitPrice: options.unitPrice ?? plan.price,
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback((key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const updateCartQuantity = useCallback((key, quantity) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.key !== key))
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const toggleWishlist = useCallback((product) => {
    const productId = product.id ?? product.productId

    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.productId === productId)

      if (exists) {
        return prev.filter((item) => item.productId !== productId)
      }

      return [...prev, { ...snapshotProduct(product), addedAt: Date.now() }]
    })
  }, [])

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const clearWishlist = useCallback(() => {
    setWishlistItems([])
  }, [])

  const value = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      cartTotal,
      isInWishlist,
      isInCart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      cartTotal,
      isInWishlist,
      isInCart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    ],
  )

  return (
    <CartWishlistContext.Provider value={value}>
      {children}
    </CartWishlistContext.Provider>
  )
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext)

  if (!context) {
    throw new Error('useCartWishlist must be used within CartWishlistProvider')
  }

  return context
}
