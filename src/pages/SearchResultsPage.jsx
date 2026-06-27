import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORIES } from '../data/categories'
import { POPULAR_SEARCHES, searchProducts } from '../utils/productSearch'
import { ProductCard } from '../components/RentalProducts'
function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const [inputValue, setInputValue] = useState(query)
  const categoryFilter = searchParams.get('category') ?? 'all'

  useEffect(() => {
    setInputValue(query)
  }, [query])

  const results = useMemo(() => searchProducts(query), [query])

  const filteredResults = useMemo(() => {
    if (categoryFilter === 'all') return results
    return results.filter((product) => product.category === categoryFilter)
  }, [results, categoryFilter])

  const categoriesInResults = useMemo(() => {
    const ids = new Set(results.map((product) => product.category))
    return CATEGORIES.filter((cat) => ids.has(cat.id))
  }, [results])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const nextQuery = inputValue.trim()
    if (!nextQuery) return
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  const setCategory = (categoryId) => {
    const params = { q: query }
    if (categoryId !== 'all') params.category = categoryId
    setSearchParams(params)
  }

  return (
    <section className="search-page" aria-labelledby="search-results-heading">
      <div className="search-page-inner">
        <header className="search-page-header page-animate-item">
          <form className="search-page-form" role="search" onSubmit={handleSearchSubmit}>
            <Search size={20} className="search-page-form-icon" aria-hidden="true" />
            <Input
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search laptops, printers, desktops, and more..."
              aria-label="Search products"
            />
            <Button type="submit" variant="default" className="search-page-form-btn">
              Search
            </Button>
          </form>
        </header>

        {query ? (
          <>
            <div className="search-page-summary page-animate-item">
              <h1 id="search-results-heading" className="search-page-title">
                {filteredResults.length > 0
                  ? `${filteredResults.length} result${filteredResults.length === 1 ? '' : 's'} for "${query}"`
                  : `No results for "${query}"`}
              </h1>
              <p className="search-page-subtitle">
                {filteredResults.length > 0
                  ? 'Rent premium devices with doorstep delivery and flexible plans.'
                  : 'Try a different keyword or browse our full catalog.'}
              </p>
            </div>

            {results.length > 0 && categoriesInResults.length > 1 && (
              <div className="search-page-filters page-animate-item" role="tablist" aria-label="Filter by category">
                <Button
                  type="button"
                  variant="outline"
                  role="tab"
                  className={`search-filter-chip${categoryFilter === 'all' ? ' search-filter-chip--active' : ''}`}
                  aria-selected={categoryFilter === 'all'}
                  onClick={() => setCategory('all')}
                >
                  All
                </Button>
                {categoriesInResults.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant="outline"
                    role="tab"
                    className={`search-filter-chip${categoryFilter === cat.id ? ' search-filter-chip--active' : ''}`}
                    aria-selected={categoryFilter === cat.id}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            )}

            {filteredResults.length > 0 ? (
              <div className="search-results-grid">
                {filteredResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="search-empty page-animate-item">
                <p>No products in this category match your search.</p>
                <Button type="button" variant="outline" className="search-empty-btn" onClick={() => setCategory('all')}>
                  Show all matching results
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="search-empty page-animate-item">
            <p>Enter a product name, brand, or category to start searching.</p>
            <div className="search-popular">
              <span>Popular searches:</span>
              <div className="search-popular-list">
                {POPULAR_SEARCHES.map((term) => (
                  <Link key={term} to={`/search?q=${encodeURIComponent(term)}`} className="search-popular-link">
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SearchResultsPage
