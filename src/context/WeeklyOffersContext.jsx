import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  deleteWeeklyOfferDeal,
  fetchWeeklyOffers,
  saveWeeklyOfferDeal,
  saveWeeklyOffersConfig,
  seedWeeklyOffersConfigIfMissing,
  subscribeToWeeklyOffers,
} from '../backend/firestore/weeklyOffers'
import { getAdminCatalogUserId } from '../backend/firestore/adminCatalog'
import { loadWeeklyOffersDeals, getWeeklyOffersConfig, getWeeklyOffersMirror, mergeWeeklyOffers } from '../data/weeklyOffersStorage'
import { FEATURED_DEALS } from '../data/featuredDeals'
import { useAdminAuth } from './AdminAuthContext'
import { useCatalog } from './CatalogContext'

const WeeklyOffersContext = createContext(null)

export function WeeklyOffersProvider({ children }) {
  const { admin, isAdminAuthenticated } = useAdminAuth()
  const { products } = useCatalog()
  const [storedDeals, setStoredDeals] = useState(() => getWeeklyOffersMirror().deals ?? [])
  const [config, setConfig] = useState(() => getWeeklyOffersConfig())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const adminUserId = getAdminCatalogUserId()
    let active = true

    async function init() {
      try {
        await seedWeeklyOffersConfigIfMissing(adminUserId)
      } catch {
        // Fall back to defaults.
      }
    }

    init()

    const unsubscribe = subscribeToWeeklyOffers(
      adminUserId,
      (nextDeals, nextConfig) => {
        if (!active) return
        setStoredDeals(nextDeals)
        setConfig(nextConfig)
        setReady(true)
      },
      () => {
        if (active) setReady(true)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const deals = useMemo(
    () => mergeWeeklyOffers(FEATURED_DEALS, storedDeals, products),
    [storedDeals, products],
  )

  const saveDeal = useCallback(
    async (deal) => {
      if (!isAdminAuthenticated || !admin) {
        return { ok: false, error: 'Admin login required.' }
      }

      try {
        const adminUserId = getAdminCatalogUserId(admin)
        const result = await saveWeeklyOfferDeal(adminUserId, deal, admin)
        setStoredDeals(result.deals)
        setConfig(result.config)
        return { ok: true, deal }
      } catch (error) {
        return { ok: false, error: error.message || 'Unable to save weekly offer.' }
      }
    },
    [admin, isAdminAuthenticated],
  )

  const removeDeal = useCallback(
    async (dealId) => {
      if (!isAdminAuthenticated || !admin) {
        return { ok: false, error: 'Admin login required.' }
      }

      try {
        const adminUserId = getAdminCatalogUserId(admin)
        const result = await deleteWeeklyOfferDeal(adminUserId, dealId)
        setStoredDeals(result.deals)
        setConfig(result.config)
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error.message || 'Unable to remove weekly offer.' }
      }
    },
    [admin, isAdminAuthenticated],
  )

  const hideDefaultDeal = useCallback(
    async (dealId) => {
      const existing =
        deals.find((deal) => deal.id === dealId)
        ?? FEATURED_DEALS.find((deal) => deal.id === dealId)

      if (!existing) {
        return { ok: false, error: 'Deal not found.' }
      }

      return saveDeal({ ...existing, active: false, stock: 0, inStock: false })
    },
    [deals, saveDeal],
  )

  const saveConfig = useCallback(
    async (nextConfig) => {
      if (!isAdminAuthenticated || !admin) {
        return { ok: false, error: 'Admin login required.' }
      }

      try {
        const adminUserId = getAdminCatalogUserId(admin)
        const result = await saveWeeklyOffersConfig(
          adminUserId,
          { ...config, ...nextConfig },
          admin,
        )
        setStoredDeals(result.deals)
        setConfig(result.config)
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error.message || 'Unable to save timer settings.' }
      }
    },
    [admin, config, isAdminAuthenticated],
  )

  const refreshWeeklyOffers = useCallback(async () => {
    try {
      const result = await fetchWeeklyOffers(getAdminCatalogUserId(admin))
      setStoredDeals(result.deals)
      setConfig(result.config)
    } catch {
      // Keep current mirror.
    }
  }, [admin])

  const value = useMemo(
    () => ({
      deals,
      storedDeals,
      config,
      ready,
      saveDeal,
      removeDeal,
      hideDefaultDeal,
      saveConfig,
      refreshWeeklyOffers,
      defaultDeals: FEATURED_DEALS,
    }),
    [
      deals,
      storedDeals,
      config,
      ready,
      saveDeal,
      removeDeal,
      hideDefaultDeal,
      saveConfig,
      refreshWeeklyOffers,
    ],
  )

  return (
    <WeeklyOffersContext.Provider value={value}>
      {children}
    </WeeklyOffersContext.Provider>
  )
}

export function useWeeklyOffers() {
  const context = useContext(WeeklyOffersContext)
  if (!context) {
    return {
      deals: loadWeeklyOffersDeals(),
      storedDeals: [],
      config: getWeeklyOffersConfig(),
      ready: true,
      saveDeal: async () => ({ ok: false, error: 'Weekly offers unavailable.' }),
      removeDeal: async () => ({ ok: false, error: 'Weekly offers unavailable.' }),
      hideDefaultDeal: async () => ({ ok: false, error: 'Weekly offers unavailable.' }),
      saveConfig: async () => ({ ok: false, error: 'Weekly offers unavailable.' }),
      refreshWeeklyOffers: async () => {},
      defaultDeals: FEATURED_DEALS,
    }
  }
  return context
}
