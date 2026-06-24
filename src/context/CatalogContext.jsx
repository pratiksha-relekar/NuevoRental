import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCatalogUserId,
  hasCatalogPrivilege,
  seedAdminCatalogIfEmpty,
  subscribeToAdminCatalog,
  upsertAdminCategory,
  upsertAdminProduct,
} from '../backend/firestore/adminCatalog'
import {
  deleteCatalogCategory,
  deleteCatalogProduct,
  getCatalogCategories,
  getCatalogProducts,
  upsertCategory,
  upsertProduct,
} from '../data/catalogStorage'
import { useAdminAuth } from './AdminAuthContext'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const { admin, isAdminAuthenticated } = useAdminAuth()
  const [products, setProducts] = useState(() => getCatalogProducts())
  const [categories, setCategories] = useState(() => getCatalogCategories())
  const [catalogReady, setCatalogReady] = useState(false)
  const [catalogError, setCatalogError] = useState(null)

  const refresh = useCallback(() => {
    setProducts(getCatalogProducts())
    setCategories(getCatalogCategories())
  }, [])

  useEffect(() => {
    const adminUserId = getAdminCatalogUserId()
    let active = true

    async function initCatalog() {
      try {
        await seedAdminCatalogIfEmpty(adminUserId)
      } catch {
        // Fall back to local catalog if seeding fails.
      }
    }

    initCatalog()

    const unsubscribe = subscribeToAdminCatalog(
      adminUserId,
      (nextProducts, nextCategories) => {
        if (!active) return
        setProducts(nextProducts)
        setCategories(nextCategories)
        setCatalogReady(true)
        setCatalogError(null)
      },
      () => {
        if (active) {
          setCatalogReady(true)
          refresh()
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [refresh])

  const addOrUpdateProduct = useCallback(
    async (product) => {
      if (isAdminAuthenticated && hasCatalogPrivilege(admin)) {
        try {
          const adminUserId = getAdminCatalogUserId(admin)
          await upsertAdminProduct(adminUserId, product, admin)
          return { ok: true }
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unable to save product.',
          }
        }
      }

      upsertProduct(product)
      refresh()
      return { ok: true }
    },
    [admin, isAdminAuthenticated, refresh],
  )

  const removeProduct = useCallback(
    async (id) => {
      if (isAdminAuthenticated && hasCatalogPrivilege(admin)) {
        try {
          const adminUserId = getAdminCatalogUserId(admin)
          await deleteAdminProduct(adminUserId, id, admin)
          return { ok: true }
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unable to delete product.',
          }
        }
      }

      deleteCatalogProduct(id)
      refresh()
      return { ok: true }
    },
    [admin, isAdminAuthenticated, refresh],
  )

  const addOrUpdateCategory = useCallback(
    async (category) => {
      if (isAdminAuthenticated && hasCatalogPrivilege(admin)) {
        try {
          const adminUserId = getAdminCatalogUserId(admin)
          await upsertAdminCategory(adminUserId, category, admin)
          return { ok: true }
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unable to save category.',
          }
        }
      }

      upsertCategory(category)
      refresh()
      return { ok: true }
    },
    [admin, isAdminAuthenticated, refresh],
  )

  const removeCategory = useCallback(
    async (id) => {
      if (isAdminAuthenticated && hasCatalogPrivilege(admin)) {
        try {
          const adminUserId = getAdminCatalogUserId(admin)
          await deleteAdminCategory(adminUserId, id, admin)
          return { ok: true }
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unable to delete category.',
          }
        }
      }

      deleteCatalogCategory(id)
      refresh()
      return { ok: true }
    },
    [admin, isAdminAuthenticated, refresh],
  )

  const value = useMemo(
    () => ({
      products,
      categories,
      catalogReady,
      catalogError,
      canManageCatalog: isAdminAuthenticated && hasCatalogPrivilege(admin),
      addOrUpdateProduct,
      removeProduct,
      addOrUpdateCategory,
      removeCategory,
      refresh,
    }),
    [
      products,
      categories,
      catalogReady,
      catalogError,
      isAdminAuthenticated,
      admin,
      addOrUpdateProduct,
      removeProduct,
      addOrUpdateCategory,
      removeCategory,
      refresh,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }
  return context
}
