import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getProductImage } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { getSearchSuggestions, POPULAR_SEARCHES } from '../utils/productSearch'
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((cat) => [cat.id, cat.label]))

function HeaderSearch() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = query.trim().length >= 2
    ? getSearchSuggestions(query, 7)
    : []

  const showPopular = isOpen && !query.trim()
  const showSuggestions = isOpen && query.trim().length >= 2 && suggestions.length > 0
  const showNoResults = isOpen && query.trim().length >= 2 && suggestions.length === 0
  const showDropdown = showPopular || showSuggestions || showNoResults

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    setActiveIndex(-1)
  }, [query, suggestions.length])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const goToSearch = (term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setIsOpen(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    goToSearch(query)
  }

  const handleKeyDown = (event) => {
    if (!showDropdown) return

    const items = showPopular
      ? POPULAR_SEARCHES
      : suggestions.map((product) => product.title)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      if (showPopular) {
        goToSearch(POPULAR_SEARCHES[activeIndex])
      } else {
        const product = suggestions[activeIndex]
        if (product) {
          setIsOpen(false)
          navigate(`/product/${product.id}`)
        }
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="header-search-wrap" ref={rootRef}>
      <form className="header-search" role="search" onSubmit={handleSubmit}>
        <Search size={18} className="header-search-icon" aria-hidden="true" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands & categories"
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-controls="header-search-dropdown"
          aria-autocomplete="list"
          autoComplete="off"
        />
        <Button type="submit" variant="default" className="header-search-submit">
          Search
        </Button>
      </form>

      {showDropdown && (
        <div id="header-search-dropdown" className="header-search-dropdown" role="listbox">
          {showPopular && (
            <div className="header-search-section">
              <p className="header-search-section-title">Popular searches</p>
              <ul className="header-search-popular">
                {POPULAR_SEARCHES.map((term, index) => (
                  <li key={term}>
                    <Button
                      type="button"
                      variant="outline"
                      className={`header-search-popular-btn${activeIndex === index ? ' is-active' : ''}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goToSearch(term)}
                    >
                      <Search size={14} aria-hidden="true" />
                      {term}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSuggestions && (
            <div className="header-search-section">
              <p className="header-search-section-title">Products</p>
              <ul className="header-search-results">
                {suggestions.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      className={`header-search-result${activeIndex === index ? ' is-active' : ''}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="header-search-result-image">
                        <img src={getProductImage(product)} alt="" />
                      </span>
                      <span className="header-search-result-info">
                        <span className="header-search-result-title">{product.title}</span>
                        <span className="header-search-result-meta">
                          {CATEGORY_LABELS[product.category]} · ₹{product.rentalPrice}/{product.period}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                className="header-search-see-all"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToSearch(query)}
              >
                See all results for &quot;{query.trim()}&quot;
              </Button>
            </div>
          )}

          {showNoResults && (
            <div className="header-search-section header-search-section--empty">
              <p>No products found for &quot;{query.trim()}&quot;</p>
              <Button
                type="button"
                variant="outline"
                className="header-search-see-all"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToSearch(query)}
              >
                Search anyway
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HeaderSearch
