import { CATEGORIES } from '../../data/categories'
import { RENTAL_PRODUCTS } from '../../data/products'
import { loadAdminSettings } from '../../data/adminStorage'
import { COLLECTIONS, USER_SUBCOLLECTIONS } from './collections'
import {
  fetchDocument,
  fetchSubcollection,
  orderBy,
  removeSubDocument,
  saveDocument,
  saveSubDocument,
  subscribeToSubcollection,
} from './client'

const PRODUCTS_MIRROR_KEY = 'nuevo-rental-firestore-products'
const CATEGORIES_MIRROR_KEY = 'nuevo-rental-firestore-categories'

export const ADMIN_PRIVILEGES = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_CATEGORIES: 'manage_categories',
}

const DEFAULT_ADMIN_PRIVILEGES = [
  ADMIN_PRIVILEGES.MANAGE_PRODUCTS,
  ADMIN_PRIVILEGES.MANAGE_CATEGORIES,
  'manage_orders',
  'manage_users',
  'manage_kyc',
  'manage_content',
  'manage_support',
]

function saveMirror(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors.
  }
}

export function getAdminCatalogUserId(admin) {
  const username = admin?.username ?? loadAdminSettings().username
  return username.trim().toLowerCase()
}

/** @deprecated Use getAdminCatalogUserId — admin catalog is keyed by username, not email. */
export function getAdminCatalogEmail(admin) {
  return getAdminCatalogUserId(admin)
}

export function hasCatalogPrivilege(admin) {
  if (!admin) return false
  if (admin.role === 'super_admin' || admin.role === 'admin') return true
  return (
    admin.privileges?.includes(ADMIN_PRIVILEGES.MANAGE_PRODUCTS)
    || admin.privileges?.includes(ADMIN_PRIVILEGES.MANAGE_CATEGORIES)
  )
}

export function assertCatalogPrivilege(admin, privilege) {
  if (!hasCatalogPrivilege(admin)) {
    throw new Error('Admin privileges required to manage the catalog.')
  }
  if (
    admin.role !== 'super_admin'
    && admin.role !== 'admin'
    && privilege
    && !admin.privileges?.includes(privilege)
  ) {
    throw new Error('You do not have permission for this catalog action.')
  }
}

function enrichProduct(product) {
  return {
    location: 'Pan India',
    status: 'active',
    condition: product.refurbished ? 'Refurbished' : 'New',
    source: product.source ?? 'catalog',
    description: '',
    additionalInfo: '',
    imageUrl: '',
    images: [],
    featured: false,
    verified: true,
    ...product,
    id: Number(product.id) || product.id,
  }
}

function enrichCategory(category) {
  return {
    description: '',
    imageUrl: '',
    icon: 'laptop',
    ...category,
  }
}

function normalizeProductRecord(record) {
  return enrichProduct({
    ...record,
    id: Number(record.id ?? record.productId) || record.id,
  })
}

function normalizeCategoryRecord(record) {
  return enrichCategory(record)
}

function buildProductPayload(product) {
  return {
    productId: Number(product.id) || product.id,
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
}

function buildCategoryPayload(category) {
  return {
    categoryId: category.id?.trim(),
    id: category.id?.trim(),
    label: category.label?.trim(),
    description: category.description?.trim() || '',
    imageUrl: category.imageUrl?.trim() || '',
    icon: category.icon?.trim() || 'laptop',
    updatedAt: new Date().toISOString(),
  }
}

export function mirrorCatalogToLocalStorage(products, categories) {
  saveMirror(PRODUCTS_MIRROR_KEY, products)
  saveMirror(CATEGORIES_MIRROR_KEY, categories)
}

async function fetchAdminUserDoc(adminUserId) {
  return fetchDocument(COLLECTIONS.users, adminUserId)
}

async function saveAdminUserDoc(adminUserId, data) {
  await saveDocument(COLLECTIONS.users, adminUserId, data, true)
}

async function updateCatalogIndex(adminUserId, products, categories) {
  const existing = await fetchAdminUserDoc(adminUserId)
  const nextProductId = existing?.catalogIndex?.nextProductId ?? 1000

  await saveAdminUserDoc(adminUserId, {
    catalogIndex: {
      productCount: products.length,
      categoryCount: categories.length,
      productIds: products.map((item) => String(item.id)),
      categoryIds: categories.map((item) => item.id),
      categories: [...new Set(products.map((item) => item.category).filter(Boolean))],
      nextProductId,
      updatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  })
}

export async function ensureAdminCatalogUser(admin) {
  const adminUserId = getAdminCatalogUserId(admin)
  const existing = await fetchAdminUserDoc(adminUserId)
  const now = new Date().toISOString()

  await saveAdminUserDoc(adminUserId, {
    username: adminUserId,
    displayName: admin?.displayName ?? 'Administrator',
    provider: 'admin',
    role: admin?.role ?? 'super_admin',
    isAdmin: true,
    privileges: admin?.privileges ?? DEFAULT_ADMIN_PRIVILEGES,
    memberSince: existing?.memberSince ?? now,
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
    updatedAt: now,
    catalogIndex: existing?.catalogIndex ?? {
      productCount: 0,
      categoryCount: 0,
      productIds: [],
      categoryIds: [],
      categories: [],
      nextProductId: 1000,
      updatedAt: now,
    },
  })
}

export async function seedAdminCatalogIfEmpty(adminUserId = getAdminCatalogUserId()) {
  await ensureAdminCatalogUser({ username: adminUserId, role: 'super_admin' })

  const [products, categories] = await Promise.all([
    fetchSubcollection(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.products),
    fetchSubcollection(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.categories),
  ])

  if (products.length > 0 || categories.length > 0) {
    return false
  }

  const now = new Date().toISOString()

  await Promise.all(
    CATEGORIES.map((category) =>
      saveSubDocument(
        COLLECTIONS.users,
        adminUserId,
        USER_SUBCOLLECTIONS.categories,
        category.id,
        {
          ...enrichCategory(category),
          source: 'seed',
          createdAt: now,
        },
      ),
    ),
  )

  await Promise.all(
    RENTAL_PRODUCTS.map((product) =>
      saveSubDocument(
        COLLECTIONS.users,
        adminUserId,
        USER_SUBCOLLECTIONS.products,
        String(product.id),
        {
          ...enrichProduct({ ...product, source: 'catalog' }),
          productId: product.id,
          createdAt: now,
        },
      ),
    ),
  )

  const seededProducts = RENTAL_PRODUCTS.map((product) =>
    enrichProduct({ ...product, source: 'catalog' }),
  )
  const seededCategories = CATEGORIES.map((category) => enrichCategory(category))
  mirrorCatalogToLocalStorage(seededProducts, seededCategories)

  await saveAdminUserDoc(adminUserId, {
    catalogIndex: {
      productCount: seededProducts.length,
      categoryCount: seededCategories.length,
      productIds: seededProducts.map((item) => String(item.id)),
      categoryIds: seededCategories.map((item) => item.id),
      categories: [...new Set(seededProducts.map((item) => item.category))],
      nextProductId: 1000,
      updatedAt: now,
    },
    updatedAt: now,
  })

  return true
}

export async function fetchAdminCatalog(adminUserId = getAdminCatalogUserId()) {
  const [products, categories] = await Promise.all([
    fetchSubcollection(
      COLLECTIONS.users,
      adminUserId,
      USER_SUBCOLLECTIONS.products,
      [orderBy('updatedAt', 'desc')],
    ),
    fetchSubcollection(
      COLLECTIONS.users,
      adminUserId,
      USER_SUBCOLLECTIONS.categories,
      [orderBy('label', 'asc')],
    ),
  ])

  const mappedProducts = products.map(normalizeProductRecord)
  const mappedCategories = normalizeCategoriesList(categories.map(normalizeCategoryRecord))
  mirrorCatalogToLocalStorage(mappedProducts, mappedCategories)
  return { products: mappedProducts, categories: mappedCategories }
}

function normalizeCategoriesList(categories) {
  const seen = new Set()
  return categories.filter((category) => {
    if (seen.has(category.id)) return false
    seen.add(category.id)
    return true
  })
}

export async function upsertAdminProduct(adminUserId, product, admin) {
  assertCatalogPrivilege(admin, ADMIN_PRIVILEGES.MANAGE_PRODUCTS)
  await ensureAdminCatalogUser(admin)

  const payload = buildProductPayload(product)
  let productId = product.id ? Number(product.id) : null

  if (!productId) {
    const existing = await fetchAdminUserDoc(adminUserId)
    productId = existing?.catalogIndex?.nextProductId ?? 1000
    await saveAdminUserDoc(adminUserId, {
      catalogIndex: {
        ...(existing?.catalogIndex ?? {}),
        nextProductId: productId + 1,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })
  }

  const docId = String(productId)
  await saveSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.products, docId, {
    ...payload,
    id: productId,
    productId,
    managedBy: admin.username,
    createdAt: product.createdAt ?? new Date().toISOString(),
  })

  const { products, categories } = await fetchAdminCatalog(adminUserId)
  await updateCatalogIndex(adminUserId, products, categories)
  return products.find((item) => item.id === productId) ?? null
}

export async function deleteAdminProduct(adminUserId, productId, admin) {
  assertCatalogPrivilege(admin, ADMIN_PRIVILEGES.MANAGE_PRODUCTS)

  await removeSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.products, String(productId))

  const { products, categories } = await fetchAdminCatalog(adminUserId)
  await updateCatalogIndex(adminUserId, products, categories)
}

export async function upsertAdminCategory(adminUserId, category, admin) {
  assertCatalogPrivilege(admin, ADMIN_PRIVILEGES.MANAGE_CATEGORIES)
  await ensureAdminCatalogUser(admin)

  const payload = buildCategoryPayload(category)
  const docId = payload.id

  if (!docId) {
    throw new Error('Category id is required.')
  }

  await saveSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.categories, docId, {
    ...payload,
    managedBy: admin.username,
    createdAt: category.createdAt ?? new Date().toISOString(),
  })

  const { products, categories } = await fetchAdminCatalog(adminUserId)
  await updateCatalogIndex(adminUserId, products, categories)
  return categories.find((item) => item.id === docId) ?? null
}

export async function deleteAdminCategory(adminUserId, categoryId, admin) {
  assertCatalogPrivilege(admin, ADMIN_PRIVILEGES.MANAGE_CATEGORIES)

  await removeSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.categories, categoryId)

  const { products, categories } = await fetchAdminCatalog(adminUserId)
  await updateCatalogIndex(adminUserId, products, categories)
}

export function subscribeToAdminCatalog(adminUserId, onData, onError) {
  let products = []
  let categories = []
  let productsReady = false
  let categoriesReady = false

  const emit = () => {
    if (!productsReady || !categoriesReady) return
    const mappedProducts = products.map(normalizeProductRecord)
    const mappedCategories = normalizeCategoriesList(categories.map(normalizeCategoryRecord))
    mirrorCatalogToLocalStorage(mappedProducts, mappedCategories)
    onData(mappedProducts, mappedCategories)
  }

  const unsubProducts = subscribeToSubcollection(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.products,
    [orderBy('updatedAt', 'desc')],
    (items) => {
      products = items
      productsReady = true
      emit()
    },
    onError,
  )

  const unsubCategories = subscribeToSubcollection(
    COLLECTIONS.users,
    adminUserId,
    USER_SUBCOLLECTIONS.categories,
    [orderBy('label', 'asc')],
    (items) => {
      categories = items
      categoriesReady = true
      emit()
    },
    onError,
  )

  return () => {
    unsubProducts()
    unsubCategories()
  }
}

export async function deleteAdminCatalog(adminUserId = getAdminCatalogUserId()) {
  const products = await fetchSubcollection(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.products)
  const categories = await fetchSubcollection(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.categories)

  await Promise.all([
    ...products.map((item) =>
      removeSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.products, item.id),
    ),
    ...categories.map((item) =>
      removeSubDocument(COLLECTIONS.users, adminUserId, USER_SUBCOLLECTIONS.categories, item.id),
    ),
  ])
}

export { PRODUCTS_MIRROR_KEY, CATEGORIES_MIRROR_KEY }
