import { RENTAL_PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { FEATURED_DEALS } from '../data/featuredDeals'

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((cat) => [cat.id, cat.label]))

const SEARCH_ALIASES = {
  laptop: ['laptops', 'notebook', 'macbook', 'hp', 'dell', 'lenovo'],
  desktop: ['desktops', 'pc', 'imac', 'computer'],
  mobile: ['mobiles', 'phone', 'iphone', 'smartphone'],
  printer: ['printers', 'laserjet', 'print'],
  monitor: ['monitors', 'display', 'screen'],
  projector: ['projectors', 'benq'],
  watch: ['wearables', 'smartwatch', 'apple watch'],
  cctv: ['camera', 'surveillance', 'security'],
  ups: ['networking', 'apc', 'router', 'wifi'],
  server: ['servers', 'poweredge'],
  ipad: ['tablets', 'tablet'],
}

function normalize(text) {
  return text.toLowerCase().trim()
}

function expandTokens(tokens) {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    for (const [key, aliases] of Object.entries(SEARCH_ALIASES)) {
      if (token.includes(key) || key.includes(token)) {
        expanded.add(key)
        aliases.forEach((alias) => expanded.add(alias))
      }
    }
  }
  return [...expanded]
}

function getDealHints(productId) {
  return FEATURED_DEALS
    .filter((deal) => deal.productId === productId)
    .map((deal) => `${deal.title} ${deal.discountPercent}% off`)
    .join(' ')
}

function scoreProduct(product, query, tokens, expandedTokens) {
  const title = normalize(product.title)
  const category = normalize(CATEGORY_LABELS[product.category] ?? product.category)
  const dealHints = normalize(getDealHints(product.id))
  const haystack = `${title} ${category} ${product.category} ${product.period} rent rental ${dealHints}`

  if (title === query) return 120
  if (title.startsWith(query)) return 95
  if (title.includes(query)) return 75
  if (category.includes(query)) return 70

  let score = 0

  if (expandedTokens.some((token) => category.includes(token))) {
    score += 35
  }

  for (const token of expandedTokens) {
    if (title.includes(token)) score += 22
    if (category.includes(token)) score += 18
    if (dealHints.includes(token)) score += 12
    if (haystack.includes(token)) score += 8
  }

  if (tokens.length > 1 && tokens.every((token) => haystack.includes(token))) {
    score += 45
  }

  if (tokens.some((token) => title.split(/\s+|—|-/).some((part) => part.startsWith(token)))) {
    score += 15
  }

  return score
}

export function searchProducts(query, { limit } = {}) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
  const expandedTokens = expandTokens(tokens)

  const ranked = RENTAL_PRODUCTS
    .map((product) => ({
      product,
      score: scoreProduct(product, normalizedQuery, tokens, expandedTokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.product.title.localeCompare(b.product.title)
    })
    .map((entry) => entry.product)

  return limit ? ranked.slice(0, limit) : ranked
}

export const POPULAR_SEARCHES = [
  'Laptop on rent',
  'HP printer',
  'Desktop',
  'Monitor',
  'Projector',
  'MacBook',
  'CCTV camera',
]

export function getSearchSuggestions(query, limit = 8) {
  return searchProducts(query, { limit })
}
