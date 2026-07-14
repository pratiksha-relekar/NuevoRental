import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LinkButton } from '@/components/ui/link-button'
import { ProductCard } from '../components/RentalProducts'
import RentalPriceModal from '../components/RentalPriceModal'
import WishlistHeartButton from '../components/WishlistHeartButton'
import { useCartWishlist } from '../context/CartWishlistContext'
import {
  getProductById,
  getRecommendedProducts,
  getRelatedProducts,
} from '../data/productDetails'
import { getDefaultProjectPlanId } from '../data/projectPlans'
const IMAGE_AUTO_MS = 3500
const GALLERY_PAUSE_MS = 5000

function StarRating({ value, reviewCount }) {
  const fullStars = Math.floor(value)
  const hasHalf = value % 1 >= 0.5

  return (
    <div className="pdp-rating">
      <div className="pdp-stars" aria-label={`${value} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index < fullStars || (index === fullStars && hasHalf)
          return (
            <svg key={index} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 1.2L9.9 5.6L14.7 6L11 9.1L12.1 14L8 11.4L3.9 14L5 9.1L1.3 6L6.1 5.6L8 1.2Z"
                fill={filled ? '#f5a623' : '#e0e0e0'}
              />
            </svg>
          )
        })}
      </div>
      <span className="pdp-review-count">({reviewCount} Customer Reviews)</span>
    </div>
  )
}

function ProductCarousel({ title, products, viewMoreHref = '/rent-products' }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [products])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * 260, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  if (products.length === 0) return null

  return (
    <section className="pdp-carousel-section" aria-labelledby={`${title}-heading`}>
      <div className="pdp-carousel-header">
        <div className="pdp-carousel-title-wrap">
          <h2 id={`${title}-heading`} className="pdp-carousel-title">{title}</h2>
          <span className="pdp-carousel-line" aria-hidden="true" />
        </div>
        <div className="pdp-carousel-actions">
          <Link to={viewMoreHref} className="pdp-carousel-view-more">
            View More →
          </Link>
          <div className="pdp-carousel-nav">
            <Button
              type="button"
              variant="outline"
              className="pdp-carousel-nav-btn"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="pdp-carousel-nav-btn"
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div
        className="pdp-carousel-track"
        ref={scrollRef}
        onScroll={updateScrollState}
      >
        {products.map((item) => (
          <div key={item.id} className="pdp-carousel-item">
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dealId = searchParams.get('deal')
  const product = useMemo(() => getProductById(id, dealId), [id, dealId])
  const relatedProducts = useMemo(() => getRelatedProducts(id), [id])
  const recommendedProducts = useMemo(() => getRecommendedProducts(id), [id])
  const { toggleWishlist, isInWishlist, addToCart } = useCartWishlist()

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedPlanId, setSelectedPlanId] = useState('1m')
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [galleryPaused, setGalleryPaused] = useState(false)
  const galleryPauseTimer = useRef(null)

  const wishlisted = product ? isInWishlist(product.id) : false

  useEffect(() => {
    setActiveImage(0)
    setQuantity(1)
    setSelectedPlanId(product ? getDefaultProjectPlanId(product) : '1m')
    setActiveTab('description')
    setShowDurationModal(false)
  }, [id, dealId, product?.id, product?.period])

  useEffect(() => {
    if (!product || product.images.length <= 1 || galleryPaused) return undefined

    const timer = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % product.images.length)
    }, IMAGE_AUTO_MS)

    return () => window.clearInterval(timer)
  }, [product, galleryPaused, id])

  const pauseGalleryBriefly = () => {
    setGalleryPaused(true)
    if (galleryPauseTimer.current) {
      window.clearTimeout(galleryPauseTimer.current)
    }
    galleryPauseTimer.current = window.setTimeout(() => {
      setGalleryPaused(false)
    }, GALLERY_PAUSE_MS)
  }

  useEffect(() => () => {
    if (galleryPauseTimer.current) {
      window.clearTimeout(galleryPauseTimer.current)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!product) {
    return (
      <section className="pdp-page pdp-page--empty">
        <div className="pdp-inner">
          <h1>Product not found</h1>
          <p>The rental item you are looking for does not exist or has been removed.</p>
          <LinkButton to="/rent-products" variant="default" className="pdp-btn pdp-btn--primary">
            Browse all products
          </LinkButton>
        </div>
      </section>
    )
  }

  const selectedPlan = product.durationPlans.find((plan) => plan.id === selectedPlanId)
    ?? product.durationPlans[1]
    ?? product.durationPlans[0]
  const unitPrice = selectedPlan?.price ?? product.rentalPrice
  const totalPrice = unitPrice * quantity
  const dealSavings = product.activeDeal
    ? Math.max(0, (product.activeDeal.originalPrice - unitPrice) * quantity)
    : 0
  const extras = product.descriptionExtras

  const handleSelectDuration = (planId) => {
    setSelectedPlanId(planId)
    setShowDurationModal(false)
  }

  const handleThumbSelect = (index) => {
    setActiveImage(index)
    pauseGalleryBriefly()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddToCart = async () => {
    await addToCart(product, {
      quantity,
      durationPlanId: selectedPlanId,
      durationPlan: selectedPlan,
      unitPrice,
    })
    navigate('/cart')
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product)
  }

  return (
    <section className="pdp-page" aria-labelledby="pdp-title">
      <div className="pdp-bg-shape pdp-bg-shape--one" aria-hidden="true" />
      <div className="pdp-bg-shape pdp-bg-shape--two" aria-hidden="true" />

      <div className="pdp-inner">
        <nav className="pdp-breadcrumb page-animate-item" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/rent-products">Rent Products</Link>
          <span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>

        <motion.article
          className="pdp-card"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pdp-layout">
            <div className="pdp-gallery-col">
              <div
                className="pdp-gallery"
                onMouseEnter={() => setGalleryPaused(true)}
                onMouseLeave={() => setGalleryPaused(false)}
              >
                <motion.div
                  className="pdp-main-image"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  {product.activeDeal && (
                    <span className="pdp-deal-ribbon">
                      {product.activeDeal.discountPercent}% OFF
                    </span>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${product.id}-${activeImage}`}
                      src={product.images[activeImage]}
                      alt={product.title}
                      className="pdp-image"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </AnimatePresence>
                </motion.div>

                <div className="pdp-gallery-dots" aria-hidden="true">
                  {product.images.map((_, index) => (
                    <span
                      key={index}
                      className={`pdp-gallery-dot${activeImage === index ? ' pdp-gallery-dot--active' : ''}`}
                    />
                  ))}
                </div>

                <div className="pdp-thumbs" role="tablist" aria-label="Product images">
                  {product.images.map((image, index) => (
                    <Button
                      key={`${image}-${index}`}
                      type="button"
                      variant="outline"
                      role="tab"
                      className={`pdp-thumb${activeImage === index ? ' pdp-thumb--active' : ''}`}
                      aria-selected={activeImage === index}
                      aria-label={`View image ${index + 1}`}
                      onClick={() => handleThumbSelect(index)}
                    >
                      <img src={image} alt="" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pdp-info-col">
              <motion.div
                className="pdp-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {product.refurbished && (
                  <Badge className="pdp-badge">Refurbished</Badge>
                )}
                {product.activeDeal && (
                  <div className="pdp-deal-banner">
                    <span className="pdp-deal-banner-tag">Weekly Best Deal</span>
                    <span className="pdp-deal-banner-text">
                      Save {product.activeDeal.discountPercent}% — limited time offer
                    </span>
                    {product.activeDeal.stock > 0 && product.activeDeal.stock <= 5 && (
                      <span className="pdp-deal-banner-stock">
                        Only {product.activeDeal.stock} left at this price
                      </span>
                    )}
                  </div>
                )}
                <h1 id="pdp-title" className="pdp-title">{product.title}</h1>
                <StarRating value={product.ratingValue} reviewCount={product.reviewCount} />

                <div className="pdp-pricing-block">
                  {product.activeDeal && (
                    <div className="pdp-price-deal-meta">
                      <span className="pdp-price-original">
                        MRP ₹{(product.activeDeal.originalPrice * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="pdp-discount-pill">
                        {product.activeDeal.discountPercent}% OFF
                      </span>
                    </div>
                  )}
                  <p className={`pdp-price${product.activeDeal ? ' pdp-price--deal' : ''}`}>
                    ₹ {totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    {selectedPlan && (
                      <span className="pdp-price-period">
                        {' '}
                        ({selectedPlan.shortLabel})
                      </span>
                    )}
                  </p>
                  {product.activeDeal && dealSavings > 0 && (
                    <p className="pdp-price-savings">
                      You save ₹{dealSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })} on this weekly deal
                    </p>
                  )}
                </div>

                <div className="pdp-divider" />

                <div className="pdp-controls">
                  <div className="pdp-control">
                    <Label htmlFor="pdp-quantity">Quantity</Label>
                    <div className="pdp-quantity">
                      <Button
                        type="button"
                        variant="outline"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      >
                        <Minus size={16} />
                      </Button>
                      <span id="pdp-quantity">{quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="pdp-control">
                    <span className="pdp-control-label">Project plan</span>
                    <Button
                      type="button"
                      variant="outline"
                      className="pdp-duration-trigger"
                      onClick={() => setShowDurationModal(true)}
                      aria-haspopup="dialog"
                    >
                      <span>{selectedPlan?.durationLabel ?? selectedPlan?.shortLabel ?? 'Select project plan'}</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <ul className="pdp-meta">
                  <li>
                    <span className="pdp-meta-label">Delivery</span>
                    <span className="pdp-meta-value">{String(product.deliveryDays).padStart(2, '0')} days</span>
                  </li>
                  <li>
                    <span className="pdp-meta-label">Stock</span>
                    <span className="pdp-meta-value">{product.stock}</span>
                  </li>
                  <li>
                    <span className="pdp-meta-label">Security deposit</span>
                    <span className="pdp-meta-value">
                      {product.deposit > 0
                        ? `₹${product.deposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'No deposit'}
                    </span>
                  </li>
                  <li>
                    <span className="pdp-meta-label">Category</span>
                    <span className="pdp-meta-value">{product.categoryLabel}</span>
                  </li>
                  <li>
                    <span className="pdp-meta-label">Brand</span>
                    <span className="pdp-meta-value">{product.brand}</span>
                  </li>
                  <li>
                    <span className="pdp-meta-label">Tags</span>
                    <span className="pdp-meta-value">{product.tags}</span>
                  </li>
                </ul>

                <div className="pdp-actions">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="default"
                      className="pdp-btn pdp-btn--cart"
                      onClick={handleAddToCart}
                    >
                      <Lock size={16} aria-hidden="true" className="pdp-cart-icon" />
                      Add To Cart
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <WishlistHeartButton
                      variant="pdp"
                      active={wishlisted}
                      onClick={handleToggleWishlist}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.article>

        <motion.section
          className="pdp-tabs-section"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="pdp-tabs" role="tablist" aria-label="Product information">
            <Button
              type="button"
              variant="outline"
              role="tab"
              className={`pdp-tab${activeTab === 'description' ? ' pdp-tab--active' : ''}`}
              aria-selected={activeTab === 'description'}
              onClick={() => setActiveTab('description')}
            >
              Description
            </Button>
            <Button
              type="button"
              variant="outline"
              role="tab"
              className={`pdp-tab${activeTab === 'additional' ? ' pdp-tab--active' : ''}`}
              aria-selected={activeTab === 'additional'}
              onClick={() => setActiveTab('additional')}
            >
              Additional Info
            </Button>
            <span
              className="pdp-tab-indicator"
              style={{ transform: activeTab === 'description' ? 'translateX(0)' : 'translateX(100%)' }}
              aria-hidden="true"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="pdp-tab-panel"
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {activeTab === 'description' ? (
                <>
                  <h2>{product.title} — High Performance, Zero Deposit</h2>
                  <p>{product.descriptionIntro}</p>
                  <h3>Specifications (Range):</h3>
                  <ul className="pdp-spec-list">
                    {product.specifications.map((spec) => (
                      <li key={spec.label}>
                        <strong>{spec.label}:</strong> {spec.value}
                      </li>
                    ))}
                  </ul>
                  <h3>Brands may include:</h3>
                  <p>{product.descriptionBrandLine}</p>

                  <h3>Service &amp; Replacement:</h3>
                  <ul className="pdp-bullet-list">
                    {extras.serviceReplacement.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>

                  <h3>Important Note:</h3>
                  <ul className="pdp-bullet-list">
                    {extras.importantNote.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>

                  <div className="pdp-info-rows">
                    <p className="pdp-info-row">
                      <MapPin size={16} aria-hidden="true" />
                      {extras.location}
                    </p>
                    <p className="pdp-info-row">
                      <Phone size={16} aria-hidden="true" />
                      {extras.idealFor}
                    </p>
                  </div>

                  <p className="pdp-keywords">{extras.keywords}</p>
                </>
              ) : (
                <div className="pdp-additional-sections">
                  {product.additionalInfoSections.map((section) => (
                    <div key={section.title} className="pdp-additional-block">
                      <h3>{section.title}</h3>
                      <ul className="pdp-bullet-list">
                        {section.items.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        <ProductCarousel title="Related Items" products={relatedProducts} />

        <ProductCarousel
          title="Customers Also Viewed"
          products={recommendedProducts}
          viewMoreHref="/rent-products"
        />
      </div>

      <RentalPriceModal
        open={showDurationModal}
        plans={product.durationPlans}
        selectedPlanId={selectedPlanId}
        onSelect={handleSelectDuration}
        onClose={() => setShowDurationModal(false)}
      />

      <a
        href="https://wa.me/911234567890"
        className="pdp-fab pdp-fab--whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.528 5.867L0 24l6.335-1.663A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.358-.213-3.76.987 1.004-3.66-.233-.375A9.818 9.818 0 1112 21.818z" />
        </svg>
        Chat with Us
      </a>

      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="button"
            variant="default"
            className="pdp-fab pdp-fab--top"
            aria-label="Scroll to top"
            onClick={scrollToTop}
          >
            <ChevronUp size={22} />
          </Button>
        </motion.div>
      )}
    </section>
  )
}

export default ProductDetailPage
