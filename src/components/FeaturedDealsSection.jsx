import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEAL_FILTERS, FEATURED_DEALS, filterFeaturedDeals } from '../data/featuredDeals'
import GlareHover from './GlareHover'
import './FeaturedDealsSection.css'

function getCountdownTarget() {
  const target = new Date()
  target.setDate(target.getDate() + 3)
  target.setHours(23, 59, 59, 0)
  return target
}

function getTimeLeft(target) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className="deal-card-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < fullStars || (i === fullStars && hasHalf)
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M7 1L8.8 5.2L13.4 5.5L10 8.5L11 13L7 10.6L3 13L4 8.5L0.6 5.5L5.2 5.2L7 1Z"
              fill={filled ? '#f5a623' : '#ddd'}
            />
          </svg>
        )
      })}
    </div>
  )
}

function DealCard({ deal }) {
  return (
    <GlareHover
      className="deal-card-glare"
      width="100%"
      height="100%"
      background="transparent"
      borderRadius="12px"
      borderColor="transparent"
      glareColor="#ffffff"
      glareOpacity={0.4}
      glareAngle={-30}
      glareSize={280}
      transitionDuration={750}
    >
      <article className="deal-card">
        <div className="deal-card-image-wrap">
          <span className="deal-card-badge">{deal.discountPercent}% OFF</span>
          <img src={deal.image} alt={deal.title} className="deal-card-image" />
        </div>

        <div className="deal-card-body">
          <h3 className="deal-card-title">{deal.title}</h3>

          <div className="deal-card-brand">
            <span className="deal-card-brand-icon" aria-hidden="true">N</span>
            {deal.brand}
          </div>

          <div className="deal-card-pricing">
            <span className="deal-card-offer">
              ₹{deal.offerPrice.toLocaleString('en-IN')}
              <span className="deal-card-period">/{deal.period}</span>
            </span>
            <span className="deal-card-original">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="deal-card-meta">
            <StarRating rating={deal.rating} />
            <span className="deal-card-reviews">({deal.reviews})</span>
          </div>

          <p className={`deal-card-stock${deal.inStock ? ' deal-card-stock--in' : ' deal-card-stock--out'}`}>
            {deal.inStock ? `In stock (${deal.stock})` : 'Out of stock'}
          </p>

          {deal.inStock ? (
            <Link
              to={`/product/${deal.productId}?deal=${deal.id}`}
              className="deal-card-btn deal-card-btn--active"
            >
              Rent Now
            </Link>
          ) : (
            <button type="button" className="deal-card-btn" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </article>
    </GlareHover>
  )
}

function FeaturedDealsSection() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(getCountdownTarget()))
  const scrollRef = useRef(null)
  const countdownRef = useRef(getCountdownTarget())

  const filteredDeals = filterFeaturedDeals(FEATURED_DEALS, activeFilter)

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(countdownRef.current))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' })
  }

  return (
    <section className="featured-deals" id="special-offers" aria-labelledby="featured-deals-heading">
      <div className="featured-deals-inner">
        <div className="featured-deals-header">
          <div className="featured-deals-title-wrap">
            <h2 id="featured-deals-heading" className="featured-deals-title">
              Weekly Best Deals
            </h2>
            <Link to="/pricing" className="featured-deals-view-all">
              View all offers →
            </Link>
          </div>

          <div className="featured-deals-timer" aria-live="polite">
            <span className="featured-deals-timer-label">Limited time only!</span>
            <div className="featured-deals-countdown">
              <div className="featured-deals-countdown-unit">
                <span className="featured-deals-countdown-value">{pad(timeLeft.days)}</span>
              </div>
              <span className="featured-deals-countdown-sep">:</span>
              <div className="featured-deals-countdown-unit">
                <span className="featured-deals-countdown-value">{pad(timeLeft.hours)}</span>
              </div>
              <span className="featured-deals-countdown-sep">:</span>
              <div className="featured-deals-countdown-unit">
                <span className="featured-deals-countdown-value">{pad(timeLeft.minutes)}</span>
              </div>
              <span className="featured-deals-countdown-sep">:</span>
              <div className="featured-deals-countdown-unit">
                <span className="featured-deals-countdown-value">{pad(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="featured-deals-filters" role="tablist" aria-label="Deal filters">
          {DEAL_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.id}
              className={`featured-deals-filter${activeFilter === filter.id ? ' featured-deals-filter--active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="featured-deals-carousel-wrap">
          <button
            type="button"
            className="featured-deals-nav featured-deals-nav--prev"
            onClick={() => scroll(-1)}
            aria-label="Scroll deals left"
          >
            ‹
          </button>

          <div className="featured-deals-grid" ref={scrollRef}>
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          <button
            type="button"
            className="featured-deals-nav featured-deals-nav--next"
            onClick={() => scroll(1)}
            aria-label="Scroll deals right"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedDealsSection
