import laptopModernImg from '../assets/processed/laptop-modern.png'
import laptopSilverImg from '../assets/processed/laptop-silver.png'
import laptopDarkImg from '../assets/processed/laptop-dark.png'
import desktopSetupImg from '../assets/processed/desktop-setup.png'

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
    image: laptopModernImg,
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
    image: laptopSilverImg,
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
    title: 'Desktop on Rent — iMac 24" M1 Chip',
    category: 'desktops',
    image: desktopSetupImg,
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
    title: 'Tiny PC on Rent — i5/8th Gen Compact',
    category: 'desktops',
    image: desktopSetupImg,
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
    productId: 2,
    title: 'Laptop on Rent — MacBook Air M2',
    category: 'laptops',
    image: laptopDarkImg,
    brand: 'Nuevo Rental',
    rating: 4.9,
    reviews: 27,
    discountPercent: 20,
    originalPrice: 6000,
    offerPrice: 4800,
    period: 'month',
    stock: 0,
    inStock: false,
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
