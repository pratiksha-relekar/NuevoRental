import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getProductImage } from '../data/products'
import { getRentalDurationPlans } from '../data/productDetails'
import {
  addToUserCart,
  clearUserCart,
  mergeGuestCart,
  removeFromUserCart,
  subscribeToUserCart,
  updateUserCartItem,
} from '../backend/firestore/cart'
import {
  addToUserWishlist,
  clearUserWishlist,
  mergeGuestWishlist,
  removeFromUserWishlist,
  subscribeToUserWishlist,
} from '../backend/firestore/wishlist'
import { useAuth } from './AuthContext'

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
  const { user, isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState(() => loadFromStorage(CART_STORAGE_KEY, []))
  const [wishlistItems, setWishlistItems] = useState(() => loadFromStorage(WISHLIST_STORAGE_KEY, []))
  const [wishlistReady, setWishlistReady] = useState(!isAuthenticated)
  const [cartReady, setCartReady] = useState(!isAuthenticated)
  const mergedGuestWishlistRef = useRef(false)
  const mergedGuestCartRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      saveToStorage(CART_STORAGE_KEY, cartItems)
    }
  }, [cartItems, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      saveToStorage(WISHLIST_STORAGE_KEY, wishlistItems)
    }
  }, [wishlistItems, isAuthenticated])

  useEffect(() => {
    if (!user?.email) {
      mergedGuestWishlistRef.current = false
      setWishlistReady(true)
      return undefined
    }

    let active = true
    setWishlistReady(false)

    async function hydrateWishlist() {
      try {
        if (!mergedGuestWishlistRef.current) {
          const localItems = loadFromStorage(WISHLIST_STORAGE_KEY, [])
          if (localItems.length > 0) {
            await mergeGuestWishlist(user.email, localItems, user)
            saveToStorage(WISHLIST_STORAGE_KEY, [])
          }
          mergedGuestWishlistRef.current = true
        }
      } catch {
        mergedGuestWishlistRef.current = true
      } finally {
        if (active) {
          setWishlistReady(true)
        }
      }
    }

    hydrateWishlist()

    const unsubscribe = subscribeToUserWishlist(
      user.email,
      (items) => {
        if (active) {
          setWishlistItems(items)
          setWishlistReady(true)
        }
      },
      () => {
        if (active) {
          setWishlistReady(true)
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (!user?.email) {
      mergedGuestCartRef.current = false
      setCartReady(true)
      return undefined
    }

    let active = true
    setCartReady(false)

    async function hydrateCart() {
      try {
        if (!mergedGuestCartRef.current) {
          const localItems = loadFromStorage(CART_STORAGE_KEY, [])
          if (localItems.length > 0) {
            await mergeGuestCart(user.email, localItems, user)
            saveToStorage(CART_STORAGE_KEY, [])
          }
          mergedGuestCartRef.current = true
        }
      } catch {
        mergedGuestCartRef.current = true
      } finally {
        if (active) {
          setCartReady(true)
        }
      }
    }

    hydrateCart()

    const unsubscribe = subscribeToUserCart(
      user.email,
      (items) => {
        if (active) {
          setCartItems(items)
          setCartReady(true)
        }
      },
      () => {
        if (active) {
          setCartReady(true)
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

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
    (productId) => wishlistItems.some((item) => String(item.productId) === String(productId)),
    [wishlistItems],
  )

  const isInCart = useCallback(
    (productId, durationPlanId = '1m') =>
      cartItems.some((item) => item.key === buildCartKey(productId, durationPlanId)),
    [cartItems],
  )

  const addToCart = useCallback(async (product, options = {}) => {
    const productId = product.id ?? product.productId
    const quantity = Math.max(1, options.quantity ?? 1)
    const plan = options.durationPlan
      ?? getRentalDurationPlans(product).find((item) => item.id === (options.durationPlanId ?? '1m'))
      ?? getDefaultPlan(product)

    const durationPlanId = plan.id
    const key = buildCartKey(productId, durationPlanId)

    if (user?.email) {
      try {
        await addToUserCart(user.email, product, user, {
          quantity,
          durationPlanId,
          durationLabel: plan.shortLabel,
          unitPrice: options.unitPrice ?? plan.price,
          key,
        })
      } catch {
        // Fall back to local state if Firestore sync fails.
      }
      return
    }

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
  }, [user])

  const removeFromCart = useCallback(async (key) => {
    if (user?.email) {
      try {
        await removeFromUserCart(user.email, key)
      } catch {
        // Ignore Firestore errors; subscription updates state.
      }
      return
    }

    setCartItems((prev) => prev.filter((item) => item.key !== key))
  }, [user?.email])

  const updateCartQuantity = useCallback(async (key, quantity) => {
    if (user?.email) {
      try {
        if (quantity < 1) {
          await removeFromUserCart(user.email, key)
        } else {
          await updateUserCartItem(user.email, key, { quantity }, user)
        }
      } catch {
        // Ignore Firestore errors.
      }
      return
    }

    if (quantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.key !== key))
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    )
  }, [user])

  const clearCart = useCallback(async () => {
    if (user?.email) {
      try {
        await clearUserCart(user.email)
      } catch {
        // Ignore Firestore errors.
      }
      return
    }

    setCartItems([])
  }, [user?.email])

  const toggleWishlist = useCallback(async (product) => {
    const productId = product.id ?? product.productId

    if (user?.email) {
      const exists = wishlistItems.some((item) => String(item.productId) === String(productId))

      try {
        if (exists) {
          await removeFromUserWishlist(user.email, productId)
        } else {
          await addToUserWishlist(user.email, product, user)
        }
      } catch {
        // Keep UI responsive if Firestore sync fails.
      }
      return
    }

    setWishlistItems((prev) => {
      const exists = prev.some((item) => String(item.productId) === String(productId))

      if (exists) {
        return prev.filter((item) => String(item.productId) !== String(productId))
      }

      return [...prev, { ...snapshotProduct(product), addedAt: Date.now() }]
    })
  }, [user, wishlistItems])

  const removeFromWishlist = useCallback(async (productId) => {
    if (user?.email) {
      try {
        await removeFromUserWishlist(user.email, productId)
      } catch {
        // Ignore Firestore errors; local state updates via subscription.
      }
      return
    }

    setWishlistItems((prev) => prev.filter((item) => String(item.productId) !== String(productId)))
  }, [user?.email])

  const clearWishlist = useCallback(async () => {
    if (user?.email) {
      try {
        await clearUserWishlist(user.email)
      } catch {
        // Ignore Firestore errors.
      }
      return
    }

    setWishlistItems([])
  }, [user?.email])

  const value = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      cartTotal,
      wishlistReady,
      cartReady,
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
      wishlistReady,
      cartReady,
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
