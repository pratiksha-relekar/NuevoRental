import {
  laptopAsus,
  laptopMacbookSilver,
  laptopMacbookBack,
  laptopMacbookRose,
  laptopPro,
} from '../assets/laptop'
import laptopSilverImg from '../assets/processed/laptop-silver.png'
import {
  desktopDellVostro1,
  desktopLenovo,
  desktopHpProdesk,
  desktopDellVostro2,
} from '../assets/Desktop'

export const DEAL_FILTERS = [
  { id: 'all', label: 'All Deals' },
  { id: '40', label: '40% Off' },
  { id: '20', label: '20% Off' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'desktops', label: 'Desktops' },
  { id: 'monitors', label: 'Monitors' },
  { id: 'low-stock', label: 'Almost Sold Out' },
]

export const FEATURED_DEALS = [
  {
    id: 'deal-1',
    productId: 2,
    title: 'Laptop on Rent — HP ProBook i5, 16GB RAM',
    category: 'laptops',
    image: laptopAsus,
    brand: 'Nuevo Rental',
    rating: 4.8,
    reviews: 24,
    discountPercent: 40,
    originalPrice: 4500,
    offerPrice: 2700,
    period: 'month',
    stock: 3,
    inStock: true,
  },
  {
    id: 'deal-2',
    productId: 1,
    title: 'Laptop on Rent — Dell Latitude i7/10th Gen',
    category: 'laptops',
    image: laptopPro,
    brand: 'Nuevo Rental',
    rating: 4.9,
    reviews: 31,
    discountPercent: 20,
    originalPrice: 5000,
    offerPrice: 4000,
    period: 'month',
    stock: 5,
    inStock: true,
  },
  {
    id: 'deal-3',
    productId: 3,
    title: 'Desktop on Rent — Dell Vostro i5',
    category: 'desktops',
    image: desktopDellVostro1,
    brand: 'Nuevo Rental',
    rating: 5,
    reviews: 18,
    discountPercent: 40,
    originalPrice: 8000,
    offerPrice: 4800,
    period: 'month',
    stock: 2,
    inStock: true,
  },
  {
    id: 'deal-4',
    productId: 4,
    title: 'Desktop on Rent — Lenovo ThinkCentre',
    category: 'desktops',
    image: desktopLenovo,
    brand: 'Nuevo Rental',
    rating: 4.6,
    reviews: 12,
    discountPercent: 20,
    originalPrice: 3500,
    offerPrice: 2800,
    period: 'month',
    stock: 6,
    inStock: true,
  },
  {
    id: 'deal-5',
    productId: 7,
    title: 'Monitor on Rent — 27" Full HD Display',
    category: 'monitors',
    image: laptopSilverImg,
    brand: 'Nuevo Rental',
    rating: 4.7,
    reviews: 15,
    discountPercent: 40,
    originalPrice: 1200,
    offerPrice: 720,
    period: 'month',
    stock: 1,
    inStock: true,
  },
  {
    id: 'deal-6',
    productId: 19,
    title: 'Laptop on Rent — MacBook Air M2',
    category: 'laptops',
    image: laptopMacbookBack,
    brand: 'Nuevo Rental',
    rating: 4.9,
    reviews: 27,
    discountPercent: 20,
    originalPrice: 6000,
    offerPrice: 4800,
    period: 'month',
    stock: 2,
    inStock: true,
  },
  {
    id: 'deal-9',
    productId: 20,
    title: 'Laptop on Rent — MacBook Pro Rose Gold',
    category: 'laptops',
    image: laptopMacbookRose,
    brand: 'Nuevo Rental',
    rating: 4.9,
    reviews: 16,
    discountPercent: 40,
    originalPrice: 7500,
    offerPrice: 4500,
    period: 'month',
    stock: 2,
    inStock: true,
  },
  {
    id: 'deal-10',
    productId: 21,
    title: 'Laptop on Rent — MacBook Silver',
    category: 'laptops',
    image: laptopMacbookSilver,
    brand: 'Nuevo Rental',
    rating: 4.6,
    reviews: 10,
    discountPercent: 20,
    originalPrice: 5500,
    offerPrice: 4400,
    period: 'month',
    stock: 4,
    inStock: true,
  },
  {
    id: 'deal-7',
    productId: 17,
    title: 'Desktop on Rent — HP ProDesk i5',
    category: 'desktops',
    image: desktopHpProdesk,
    brand: 'Nuevo Rental',
    rating: 4.8,
    reviews: 9,
    discountPercent: 20,
    originalPrice: 4200,
    offerPrice: 3360,
    period: 'month',
    stock: 4,
    inStock: true,
  },
  {
    id: 'deal-8',
    productId: 18,
    title: 'Desktop on Rent — Dell OptiPlex',
    category: 'desktops',
    image: desktopDellVostro2,
    brand: 'Nuevo Rental',
    rating: 4.7,
    reviews: 11,
    discountPercent: 40,
    originalPrice: 3800,
    offerPrice: 2280,
    period: 'month',
    stock: 3,
    inStock: true,
  },
]

export function filterFeaturedDeals(deals, filterId) {
  switch (filterId) {
    case '40':
      return deals.filter((d) => d.discountPercent === 40)
    case '20':
      return deals.filter((d) => d.discountPercent === 20)
    case 'laptops':
    case 'desktops':
    case 'monitors':
      return deals.filter((d) => d.category === filterId)
    case 'low-stock':
      return deals.filter((d) => d.stock > 0 && d.stock <= 2)
    default:
      return deals
  }
}

export function getDealById(dealId) {
  return FEATURED_DEALS.find((deal) => deal.id === dealId) ?? null
}

export function getBestDealForProduct(productId) {
  return FEATURED_DEALS
    .filter((deal) => deal.productId === Number(productId) && deal.inStock)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0] ?? null
}

export function getDealsForProduct(productId) {
  return FEATURED_DEALS.filter((deal) => deal.productId === Number(productId))
}
