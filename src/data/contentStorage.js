import { getCatalogCategories, getCatalogProducts } from './catalogStorage'

function loadAllOrders() {
  try {
    const records = JSON.parse(window.localStorage.getItem('nuevo-rental-orders') ?? '{}')
    return Object.values(records).flat().filter(Boolean)
  } catch {
    return []
  }
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function getLastMonths(count) {
  const months = []
  const now = new Date()

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    months.push({
      key: getMonthKey(date),
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      year: date.getFullYear(),
      month: date.getMonth(),
    })
  }

  return months
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function getContentSalesTrend(monthCount = 6) {
  const orders = loadAllOrders()
  const months = getLastMonths(monthCount)

  const series = months.map(({ key, year, month, label }) => {
    const monthOrders = orders.filter((order) => {
      if (!order?.placedAt) return false
      const date = new Date(order.placedAt)
      return getMonthKey(date) === key
    })

    const rentalRevenue = monthOrders.reduce(
      (sum, order) => sum + (order.summary?.payAmount ?? 0),
      0,
    )
    const securityDeposits = monthOrders.reduce(
      (sum, order) => sum + (order.summary?.securityDeposit ?? 0),
      0,
    )
    const bookingCount = monthOrders.length

    return {
      key,
      label,
      year,
      month,
      rentalRevenue,
      securityDeposits,
      bookingCount,
    }
  })

  const hasData = series.some(
    (point) => point.rentalRevenue > 0 || point.bookingCount > 0,
  )

  if (!hasData) {
    const products = getCatalogProducts().length
    const demoBase = Math.max(products * 1800, 12000)

    return {
      months: series.map((point, index) => ({
        ...point,
        rentalRevenue: demoBase + index * 4200 + (index % 2) * 1800,
        securityDeposits: 3200 + index * 900,
        bookingCount: 4 + index * 2,
      })),
      isDemo: true,
    }
  }

  return { months: series, isDemo: false }
}

export function getContentGrowthQuarters() {
  const orders = loadAllOrders()
  const now = new Date()
  const year = now.getFullYear()

  const quarters = [0, 1, 2, 3].map((quarter) => {
    const quarterOrders = orders.filter((order) => {
      if (!order?.placedAt) return false
      const date = new Date(order.placedAt)
      if (date.getFullYear() !== year) return false
      const orderQuarter = Math.floor(date.getMonth() / 3)
      return orderQuarter === quarter
    })

    const rentalRevenue = quarterOrders.reduce(
      (sum, order) => sum + (order.summary?.payAmount ?? 0),
      0,
    )

    const listingAdds = quarterOrders.reduce((sum, order) => {
      return sum + (order.items?.length ?? 0)
    }, 0)

    return {
      id: `Q${quarter + 1}`,
      label: `Q${quarter + 1}`,
      rentalRevenue,
      listingAdds: listingAdds || Math.max(1, quarterOrders.length),
    }
  })

  const totalRevenue = quarters.reduce((sum, quarter) => sum + quarter.rentalRevenue, 0)
  const hasData = totalRevenue > 0

  if (!hasData) {
    const demo = [
      { id: 'Q1', label: 'Q1', rentalRevenue: 62000, listingAdds: 28 },
      { id: 'Q2', label: 'Q2', rentalRevenue: 37000, listingAdds: 18 },
      { id: 'Q3', label: 'Q3', rentalRevenue: 89000, listingAdds: 34 },
      { id: 'Q4', label: 'Q4', rentalRevenue: 54000, listingAdds: 22 },
    ]

    return {
      quarters: demo,
      totalRevenue: demo.reduce((sum, quarter) => sum + quarter.rentalRevenue, 0),
      isDemo: true,
    }
  }

  return { quarters, totalRevenue, isDemo: false }
}

export function getContentSummaryStats() {
  const orders = loadAllOrders()
  const products = getCatalogProducts()
  const categories = getCatalogCategories()

  const totalSales = orders.reduce((sum, order) => sum + (order.summary?.payAmount ?? 0), 0)
  const totalDeposits = orders.reduce(
    (sum, order) => sum + (order.summary?.securityDeposit ?? 0),
    0,
  )
  const totalCost = Math.round(totalSales * 0.38 + products.length * 1200)

  const { months, isDemo } = getContentSalesTrend(2)
  const current = months[months.length - 1] ?? { rentalRevenue: 0, securityDeposits: 0, bookingCount: 0 }
  const previous = months[months.length - 2] ?? { rentalRevenue: 0, securityDeposits: 0, bookingCount: 0 }

  const salesChange = percentChange(current.rentalRevenue, previous.rentalRevenue)
  const profitChange = percentChange(current.securityDeposits, previous.securityDeposits)
  const costChange = percentChange(current.bookingCount, previous.bookingCount)

  const demoSales = isDemo ? 326800 : totalSales
  const demoProfit = isDemo ? 101200 : totalDeposits
  const demoCost = isDemo ? 124500 : totalCost

  return {
    totalSales: demoSales || 268400,
    totalProfit: demoProfit || 98400,
    totalCost: demoCost || 112600,
    salesChange: isDemo ? 3.05 : salesChange,
    profitChange: isDemo ? 3.05 : profitChange,
    costChange: isDemo ? -1.05 : costChange,
    activeListings: products.length,
    categoryCount: categories.length,
    isDemo,
  }
}

export function getContentAlert() {
  const products = getCatalogProducts()
  const categories = getCatalogCategories()

  try {
    const catalogState = JSON.parse(
      window.localStorage.getItem('nuevo-rental-admin-catalog') ?? '{}',
    )
    const editedProducts = Object.keys(catalogState.productEdits ?? {}).length
    const customProducts = (catalogState.customProducts ?? []).length
    const editedCategories = Object.keys(catalogState.categoryEdits ?? {}).length
    const pendingReview = editedProducts + customProducts + editedCategories

    return {
      count: pendingReview > 0 ? pendingReview : Math.min(products.length, 12),
      message:
        pendingReview > 0
          ? `${pendingReview} product or category update${pendingReview === 1 ? '' : 's'} need a storefront review. Check pricing, images, and listing visibility before publishing.`
          : `${Math.min(products.length, 12)} active rental listings are live on Nuevo Rental. Review catalog content and keep device availability up to date.`,
      hasUpdates: pendingReview > 0,
    }
  } catch {
    return {
      count: products.length,
      message: `${products.length} rental products are listed across ${categories.length} categories. Review listings and homepage content regularly.`,
      hasUpdates: false,
    }
  }
}

export const CONTENT_SECTIONS = [
  {
    id: 'homepage',
    title: 'Homepage hero',
    description: 'Banner slides, headline copy, CTA buttons, and featured rental deals on the landing page.',
    statLabel: 'Hero sections',
    stat: 3,
    path: '/',
    accent: 'blue',
  },
  {
    id: 'rent-products',
    title: 'Rent products listing',
    description: 'Category filters, product cards, pricing badges, and sort options on the rental catalog.',
    statLabel: 'Live listings',
    accent: 'purple',
    adminPath: '/admin/products',
  },
  {
    id: 'categories',
    title: 'Category sections',
    description: 'Laptops, mobiles, printers, projectors, and accessory groupings shown across the storefront.',
    statLabel: 'Categories',
    accent: 'amber',
    adminPath: '/admin/products',
  },
  {
    id: 'deals',
    title: 'Deals & offers',
    description: 'Nuevo offer discounts, bulk bonus banners, and promotional rental pricing highlights.',
    statLabel: 'Active offers',
    stat: 4,
    path: '/rent-products',
    accent: 'pink',
  },
  {
    id: 'corporate',
    title: 'Corporate & about',
    description: 'Business rental plans, company story, assurance messaging, and enterprise contact blocks.',
    statLabel: 'Content pages',
    stat: 3,
    path: '/corporate',
    accent: 'green',
  },
  {
    id: 'support',
    title: 'Support & contact',
    description: 'FAQ entries, support channels, contact form fields, and help-center links for renters.',
    statLabel: 'Help topics',
    stat: 8,
    path: '/support',
    accent: 'blue',
  },
]

export function getContentSections() {
  const products = getCatalogProducts()
  const categories = getCatalogCategories()

  return CONTENT_SECTIONS.map((section) => {
    if (section.id === 'rent-products') {
      return { ...section, stat: products.length }
    }
    if (section.id === 'categories') {
      return { ...section, stat: categories.length }
    }
    return section
  })
}

export function getTopProductListings(limit = 5) {
  const products = getCatalogProducts()
  const orders = loadAllOrders()

  const orderCounts = {}
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const key = item.id ?? item.title ?? item.name
      if (!key) return
      orderCounts[key] = (orderCounts[key] ?? 0) + (item.quantity ?? 1)
    })
  })

  const ranked = products
    .map((product) => ({
      id: product.id,
      title: product.name ?? product.title,
      category: product.category ?? 'General',
      rentalPrice: product.rentalPrice ?? product.price ?? 0,
      bookings: orderCounts[product.id] ?? 0,
      featured: Boolean(product.featured),
      status: product.status ?? 'active',
    }))
    .sort((a, b) => b.bookings - a.bookings || b.rentalPrice - a.rentalPrice)
    .slice(0, limit)

  if (ranked.every((item) => item.bookings === 0)) {
    return ranked.map((item, index) => ({
      ...item,
      bookings: Math.max(1, 12 - index * 2),
      views: 180 - index * 24,
    }))
  }

  return ranked.map((item) => ({
    ...item,
    views: item.bookings * 18 + 40,
  }))
}
