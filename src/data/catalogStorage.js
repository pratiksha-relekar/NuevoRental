import { CATEGORIES } from './categories'
import { RENTAL_PRODUCTS } from './products'
import {
  CATEGORIES_MIRROR_KEY,
  PRODUCTS_MIRROR_KEY,
} from '../backend/firestore/adminCatalog'

const STORAGE_KEY = 'nuevo-rental-admin-catalog'

const DEFAULT_STATE = {
  customProducts: [],
  productEdits: {},
  deletedProductIds: [],
  customCategories: [],
  categoryEdits: {},
  deletedCategoryIds: [],
  nextProductId: 1000,
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

function loadMirror(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function enrichProduct(product) {
  return {
    location: 'Pan India',
    status: 'active',
    condition: product.refurbished ? 'Refurbished' : 'New',
    source: 'catalog',
    description: '',
    additionalInfo: '',
    imageUrl: '',
    images: [],
    featured: false,
    verified: true,
    ...product,
  }
}

export function getCatalogProducts() {
  const firestoreProducts = loadMirror(PRODUCTS_MIRROR_KEY)
  if (Array.isArray(firestoreProducts) && firestoreProducts.length > 0) {
    return firestoreProducts.map((product) => enrichProduct(product))
  }

  const state = loadState()
  const deleted = new Set(state.deletedProductIds)

  const seeded = RENTAL_PRODUCTS
    .filter((product) => !deleted.has(product.id))
    .map((product) => enrichProduct({ ...product, ...state.productEdits[product.id] }))

  const custom = state.customProducts.map((product) => enrichProduct(product))
  return [...seeded, ...custom]
}

export function getCatalogCategories() {
  const firestoreCategories = loadMirror(CATEGORIES_MIRROR_KEY)
  if (Array.isArray(firestoreCategories) && firestoreCategories.length > 0) {
    const seen = new Set()
    return firestoreCategories.filter((category) => {
      if (seen.has(category.id)) return false
      seen.add(category.id)
      return true
    })
  }

  const state = loadState()
  const deleted = new Set(state.deletedCategoryIds)

  const seeded = CATEGORIES
    .filter((category) => !deleted.has(category.id))
    .map((category) => ({
      description: '',
      imageUrl: '',
      ...category,
      ...state.categoryEdits[category.id],
    }))

  const custom = (state.customCategories ?? [])
    .filter((category) => !deleted.has(category.id))
    .map((category) => ({
      icon: 'laptop',
      imageUrl: '',
      description: '',
      ...category,
    }))
  const merged = [...seeded, ...custom]

  const seen = new Set()
  return merged.filter((category) => {
    if (seen.has(category.id)) return false
    seen.add(category.id)
    return true
  })
}

export function getCategoryLabelMap() {
  return Object.fromEntries(getCatalogCategories().map((cat) => [cat.id, cat.label]))
}

function persist(mutator) {
  const state = loadState()
  const next = mutator(state)
  saveState(next)
  return next
}

export function upsertProduct(product) {
  persist((state) => {
    const payload = {
      title: product.title?.trim(),
      category: product.category,
      rentalPrice: Number(product.rentalPrice) || 0,
      originalPrice: Number(product.originalPrice) || 0,
      period: product.period || 'month',
      location: product.location?.trim() || 'Pan India',
      condition: product.condition || 'New',
      status: product.status || 'active',
      description: product.description?.trim() || '',
      additionalInfo: product.additionalInfo?.trim() || '',
      imageUrl: product.imageUrl?.trim() || '',
      images: Array.isArray(product.images)
        ? product.images
        : String(product.images ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
      deliveryDays: Number(product.deliveryDays) || 3,
      rating: Number(product.rating) || 5,
      featured: Boolean(product.featured),
      verified: Boolean(product.verified),
      refurbished: Boolean(product.refurbished),
      source: product.source || 'admin',
      updatedAt: new Date().toISOString(),
    }

    if (product.id) {
      const isSeed = RENTAL_PRODUCTS.some((item) => item.id === product.id)
      if (isSeed) {
        return {
          ...state,
          productEdits: {
            ...state.productEdits,
            [product.id]: {
              ...state.productEdits[product.id],
              ...payload,
            },
          },
        }
      }

      return {
        ...state,
        customProducts: state.customProducts.map((item) =>
          item.id === product.id ? { ...item, ...payload, id: product.id } : item,
        ),
      }
    }

    const id = state.nextProductId
    return {
      ...state,
      nextProductId: id + 1,
      customProducts: [
        ...state.customProducts,
        {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
        },
      ],
    }
  })
}

export function deleteCatalogProduct(id) {
  persist((state) => {
    const numericId = Number(id)
    const isSeed = RENTAL_PRODUCTS.some((item) => item.id === numericId)

    if (isSeed) {
      return {
        ...state,
        deletedProductIds: [...new Set([...state.deletedProductIds, numericId])],
      }
    }

    return {
      ...state,
      customProducts: state.customProducts.filter((item) => item.id !== numericId),
    }
  })
}

export function upsertCategory(category) {
  persist((state) => {
    const payload = {
      id: category.id?.trim(),
      label: category.label?.trim(),
      description: category.description?.trim() || '',
      updatedAt: new Date().toISOString(),
    }

    const isSeed = CATEGORIES.some((item) => item.id === payload.id)

    if (isSeed) {
      return {
        ...state,
        categoryEdits: {
          ...state.categoryEdits,
          [payload.id]: {
            ...state.categoryEdits[payload.id],
            ...payload,
          },
        },
      }
    }

    const exists = state.customCategories.some((item) => item.id === payload.id)
    if (exists) {
      return {
        ...state,
        customCategories: state.customCategories.map((item) =>
          item.id === payload.id ? { ...item, ...payload } : item,
        ),
      }
    }

    return {
      ...state,
      customCategories: [
        ...state.customCategories,
        { ...payload, createdAt: new Date().toISOString() },
      ],
    }
  })
}

export function deleteCatalogCategory(id) {
  persist((state) => {
    const isSeed = CATEGORIES.some((item) => item.id === id)
    if (isSeed) {
      return {
        ...state,
        deletedCategoryIds: [...new Set([...state.deletedCategoryIds, id])],
      }
    }

    return {
      ...state,
      customCategories: state.customCategories.filter((item) => item.id !== id),
    }
  })
}

export function slugifyCategoryId(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
