import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/RentalProducts'
import { useCatalog } from '../context/CatalogContext'
import { getProductPlanPricing, RENTAL_DURATION_FILTERS } from '../data/projectPlans'
import '../styles/pageAnimations.css'
import '../components/RentalProducts.css'
import './RentProductsPage.css'

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
    category: categoryFromUrl && categoryFromUrl !== 'all' ? categoryFromUrl : 'all',
  }))

  useEffect(() => {
    if (categoryFromUrl) {
      setFilters((prev) => ({ ...prev, category: categoryFromUrl }))
    }
  }, [categoryFromUrl])

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
              <button type="button" className="rent-products-reset" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-category">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[0]}
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-city">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[1]}
              </label>
              <select
                id="filter-city"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-duration">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[2]}
              </label>
              <select
                id="filter-duration"
                value={filters.duration}
                onChange={(e) => updateFilter('duration', e.target.value)}
              >
                {DURATIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-price">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[3]}
              </label>
              <select
                id="filter-price"
                value={filters.priceRange}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
              >
                {PRICE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-brand">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[4]}
              </label>
              <select
                id="filter-brand"
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
              >
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="rent-products-filter-group">
              <label className="rent-products-filter-label" htmlFor="filter-specs">
                <span className="rent-products-filter-check" aria-hidden="true">✓</span>
                {FILTER_LABELS[5]}
              </label>
              <select
                id="filter-specs"
                value={filters.specs}
                onChange={(e) => updateFilter('specs', e.target.value)}
              >
                {SPECS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
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
                  <button type="button" onClick={resetFilters}>Clear all filters</button>
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
