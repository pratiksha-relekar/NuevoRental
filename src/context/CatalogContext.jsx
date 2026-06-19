import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  deleteCatalogCategory,
  deleteCatalogProduct,
  getCatalogCategories,
  getCatalogProducts,
  upsertCategory,
  upsertProduct,
} from '../data/catalogStorage'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'nuevo-rental-admin-catalog') refresh()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refresh])

  const products = useMemo(() => getCatalogProducts(), [version])
  const categories = useMemo(() => getCatalogCategories(), [version])

  const addOrUpdateProduct = useCallback(
    (product) => {
      upsertProduct(product)
      refresh()
    },
    [refresh],
  )

  const removeProduct = useCallback(
    (id) => {
      deleteCatalogProduct(id)
      refresh()
    },
    [refresh],
  )

  const addOrUpdateCategory = useCallback(
    (category) => {
      upsertCategory(category)
      refresh()
    },
    [refresh],
  )

  const removeCategory = useCallback(
    (id) => {
      deleteCatalogCategory(id)
      refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      products,
      categories,
      addOrUpdateProduct,
      removeProduct,
      addOrUpdateCategory,
      removeCategory,
      refresh,
    }),
    [
      products,
      categories,
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
