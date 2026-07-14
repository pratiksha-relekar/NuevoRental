import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard } from '../components/RentalProducts'
import { useCatalog } from '../context/CatalogContext'
import { CATEGORIES as SEED_CATEGORIES } from '../data/categories'
import { getProductPlanPricing, RENTAL_DURATION_FILTERS } from '../data/projectPlans'

const FILTER_CATEGORY_IDS = [
  'laptops',
  'desktops',
  'printers',
  'projectors',
  'tvs',
  'accessories',
]

const FILTER_CATEGORY_LABELS = {
  projectors: 'Projector',
  accessories: 'Accessories (Keyboards, Mouse, UPS, Webcam)',
}
const FILTER_LABELS = [
  'Category',
  'City',
  'Duration',
  'Price Range',
  'Brand',
  'RAM / Specs',
]

const CITIES = [
  'All Cities',
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
]

const DURATIONS = RENTAL_DURATION_FILTERS

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all', min: 0, max: Infinity },
  { label: 'Under ₹1,000', value: 'under-1000', min: 0, max: 999 },
  { label: '₹1,000 – ₹3,000', value: 'mid', min: 1000, max: 3000 },
  { label: '₹3,000 – ₹5,000', value: 'high', min: 3000, max: 5000 },
  { label: 'Above ₹5,000', value: 'premium', min: 5001, max: Infinity },
]

const BRANDS = ['All Brands', 'Dell', 'HP', 'Apple', 'BenQ', 'TP-Link', 'APC', 'Logitech', 'iPad']

const SPECS = ['All Specs', '16GB', 'i5', 'i7', 'M1', 'Full HD', '1000VA']

const DEFAULT_FILTERS = {
  category: 'all',
  city: 'All Cities',
  duration: 'all',
  priceRange: 'all',
  brand: 'All Brands',
  specs: 'All Specs',
}

function RentProductsPage() {
  const { products, categories } = useCatalog()
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category:
      categoryFromUrl && categoryFromUrl !== 'all' ? categoryFromUrl : DEFAULT_FILTERS.category,
  }))

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category:
        categoryFromUrl && categoryFromUrl !== 'all' ? categoryFromUrl : DEFAULT_FILTERS.category,
    }))
  }, [categoryFromUrl])

  const filterCategories = useMemo(() => {
    const catalogById = Object.fromEntries(categories.map((cat) => [cat.id, cat]))
    const seedById = Object.fromEntries(SEED_CATEGORIES.map((cat) => [cat.id, cat]))

    return FILTER_CATEGORY_IDS.map((id) => {
      const category = catalogById[id] || seedById[id]
      if (!category) return null

      return {
        ...category,
        label: FILTER_CATEGORY_LABELS[id] ?? category.label,
      }
    }).filter(Boolean)
  }, [categories])

  const filteredProducts = useMemo(() => {
    const priceRange = PRICE_RANGES.find((range) => range.value === filters.priceRange) ?? PRICE_RANGES[0]

    return products.filter((product) => {
      if (product.status === 'inactive' || product.status === 'draft') return false
      if (filters.category !== 'all' && product.category !== filters.category) return false

      const planPricing = getProductPlanPricing(product, filters.duration)
      if (planPricing.price < priceRange.min || planPricing.price > priceRange.max) return false

      if (filters.brand !== 'All Brands' && !product.title.includes(filters.brand)) return false
      if (filters.specs !== 'All Specs' && !product.title.includes(filters.specs)) return false
      return true
    })
  }, [filters, products])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <section className="rent-products-page" aria-labelledby="rent-products-heading">
      <div className="rent-products-page-inner">
        <header className="rent-products-hero">
          <span className="page-eyebrow">Rent Products</span>
          <h1 id="rent-products-heading" className="page-title">
            Rent Electronics That Power Your Work
          </h1>
          <p className="rent-products-tagline page-animate-item">
            Browse reliable devices for every need — business, study, events or personal use.
          </p>
          <p className="rent-products-intro page-animate-item">
            All devices are professionally tested, sanitized and ready to perform. Choose flexible
            plans and get doorstep delivery.
          </p>
        </header>

        <div className="rent-products-layout">
          <aside className="rent-products-filters page-animate-item" aria-label="Product filters">
            <div className="rent-products-filters-head">
              <h2>Filters</h2>
              <Button type="button" variant="outline" className="rent-products-reset" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-category">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[0]}
              </Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger id="filter-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-city">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[1]}
              </Label>
              <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
                <SelectTrigger id="filter-city" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-duration">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[2]}
              </Label>
              <Select value={filters.duration} onValueChange={(value) => updateFilter('duration', value)}>
                <SelectTrigger id="filter-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-price">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[3]}
              </Label>
              <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                <SelectTrigger id="filter-price" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-brand">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[4]}
              </Label>
              <Select value={filters.brand} onValueChange={(value) => updateFilter('brand', value)}>
                <SelectTrigger id="filter-brand" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rent-products-filter-group">
              <Label className="rent-products-filter-label" htmlFor="filter-specs">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[5]}
              </Label>
              <Select value={filters.specs} onValueChange={(value) => updateFilter('specs', value)}>
                <SelectTrigger id="filter-specs" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECS.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </aside>

          <div className="rent-products-results">
            <p className="rent-products-count page-animate-item">
              Showing <strong>{filteredProducts.length}</strong> devices
              {filters.city !== 'All Cities' ? ` in ${filters.city}` : ''}
              {filters.duration !== 'all'
                ? ` · ${DURATIONS.find((item) => item.value === filters.duration)?.label ?? filters.duration} plans`
                : ''}
            </p>

            <div className="rent-products-grid-page">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    durationFilter={filters.duration}
                  />
                ))
              ) : (
                <div className="rent-products-empty page-animate-item">
                  <p>No products match your filters.</p>
                  <Button type="button" variant="outline" onClick={resetFilters}>Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RentProductsPage
