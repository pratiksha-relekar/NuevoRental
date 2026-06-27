import { Link } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProductImage } from '../data/products'
import { getDefaultProjectPlanId, getProductPlanPricing } from '../data/projectPlans'
import { useCatalog } from '../context/CatalogContext'
import { useCartWishlist } from '../context/CartWishlistContext'
function StarRating({ count = 5 }) {
  return (
    <div className="product-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M7 1L8.8 5.2L13.4 5.5L10 8.5L11 13L7 10.6L3 13L4 8.5L0.6 5.5L5.2 5.2L7 1Z"
            fill={i < count ? '#f5a623' : '#ddd'}
          />
        </svg>
      ))}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14S1.5 9.5 1.5 5.5C1.5 3.5 3 2 5 2C6.5 2 7.5 2.8 8 4C8.5 2.8 9.5 2 11 2C13 2 14.5 3.5 14.5 5.5C14.5 9.5 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1 1H3L4.5 11H14L16 4H5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="15" r="1.2" fill="currentColor" />
      <circle cx="13" cy="15" r="1.2" fill="currentColor" />
    </svg>
  )
}


export function ProductCard({ product, durationFilter = 'all' }) {
  const { toggleWishlist, isInWishlist, addToCart } = useCartWishlist()
  const [cartAdded, setCartAdded] = useState(false)
  const cartTimer = useRef(null)
  const wishlisted = isInWishlist(product.id)
  const imageSrc = getProductImage(product)
  const planPricing = useMemo(
    () => getProductPlanPricing(product, durationFilter),
    [product, durationFilter],
  )

  const handleWishlist = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(product)
  }

  const handleAddToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()
    addToCart(product, {
      quantity: 1,
      durationPlanId: planPricing.durationPlanId ?? getDefaultProjectPlanId(product),
    })
    setCartAdded(true)
    if (cartTimer.current) window.clearTimeout(cartTimer.current)
    cartTimer.current = window.setTimeout(() => setCartAdded(false), 600)
  }

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className={`product-card-image${product.category === 'desktops' ? ' product-card-image--desktop' : ''}${product.category === 'laptops' ? ' product-card-image--laptop' : ''}${product.category === 'mobiles' ? ' product-card-image--mobile' : ''}${product.category === 'printers' ? ' product-card-image--printer' : ''}${product.category === 'projectors' ? ' product-card-image--projector' : ''}${product.category === 'wearables' ? ' product-card-image--wearable' : ''}${product.category === 'tvs' ? ' product-card-image--tv' : ''}`}>
          {product.refurbished && (
            <Badge className="product-badge">REFURBISHED</Badge>
          )}

          <img
            src={imageSrc}
            alt={product.title}
            className={`product-image${product.category === 'desktops' ? ' product-image--desktop' : ''}${product.category === 'laptops' ? ' product-image--laptop' : ''}${product.category === 'mobiles' ? ' product-image--mobile' : ''}${product.category === 'printers' ? ' product-image--printer' : ''}${product.category === 'projectors' ? ' product-image--projector' : ''}${product.category === 'wearables' ? ' product-image--wearable' : ''}${product.category === 'tvs' ? ' product-image--tv' : ''}`}
          />

          <div className="product-hover-actions">
            <span className="product-action-btn" aria-hidden="true">
              <EyeIcon />
            </span>
            <Button
              type="button"
              variant="outline"
              className={`product-action-btn product-action-btn--wishlist${wishlisted ? ' product-action-btn--active' : ''}`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              onClick={handleWishlist}
            >
              <HeartIcon filled={wishlisted} />
            </Button>
          </div>
        </div>

        <div className="product-card-body">
          <StarRating count={product.rating} />
          <h3 className="product-title">{product.title}</h3>
          <div className="product-pricing">
            <span className="product-original">₹{product.originalPrice}</span>
            <span className="product-rental">
              ₹{planPricing.price}
              <span className="product-period">/{planPricing.period}</span>
            </span>
          </div>
          <div className="product-footer">
            <span className="product-delivery">
              Delivery {String(product.deliveryDays).padStart(2, '0')} days
            </span>
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              className={`product-cart-btn${cartAdded ? ' product-cart-btn--added' : ''}`}
              aria-label={`Add ${product.title} to cart`}
              onClick={handleAddToCart}
            >
              <CartIcon />
            </Button>
          </div>
        </div>
      </Link>
    </article>
  )
}

function RentalProducts({ activeCategory = 'all' }) {
  const { products } = useCatalog()
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const visibleProducts = products.filter((product) => product.status !== 'inactive' && product.status !== 'draft')

  const filtered =
    activeCategory === 'all'
      ? visibleProducts
      : visibleProducts.filter((p) => p.category === activeCategory)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * 280, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  return (
    <section className="rental-products" id="rental-products" aria-label="Available for rent">
      <div className="rental-products-inner">
        <div className="rental-products-header">
          <div className="rental-products-title-wrap">
            <h2 className="rental-products-title">Available for Rent</h2>
            <span className="rental-products-line" aria-hidden="true" />
          </div>
          <div className="rental-products-nav">
            <Button
              type="button"
              variant="outline"
              className="rental-nav-btn"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rental-nav-btn"
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              ›
            </Button>
          </div>
        </div>

        <div
          className="rental-products-grid"
          ref={scrollRef}
          onScroll={updateScrollState}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <a
        href="https://wa.me/911234567890"
        className="whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.528 5.867L0 24l6.335-1.663A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.358-.213-3.76.987 1.004-3.66-.233-.375A9.818 9.818 0 1112 21.818z" />
        </svg>
        Chat with Us
      </a>
    </section>
  )
}

export default RentalProducts
