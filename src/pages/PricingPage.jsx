import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './PricingPage.css'

const BILLING_CYCLES = [
  { id: 'weekly', label: 'Weekly', suffix: '/week' },
  { id: 'monthly', label: 'Monthly', suffix: '/month' },
  { id: 'yearly', label: 'Yearly', suffix: '/year' },
]

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter Rental',
    tagline: 'Individuals & freelancers',
    prices: {
      weekly: { current: 999, original: 1299 },
      monthly: { current: 3499, original: 4299 },
      yearly: { current: 33500, original: 42000 },
    },
    features: [
      'Laptops, tablets & mobiles',
      'Free doorstep delivery',
      '7-day flexible returns',
      'Standard support (9am–6pm)',
    ],
    cta: { label: 'Get Started', to: '/rent-products?category=laptops' },
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    tagline: 'Most popular choice',
    featured: true,
    prices: {
      weekly: { current: 1499, original: 1899 },
      monthly: { current: 4999, original: 5999 },
      yearly: { current: 47900, original: 59900 },
    },
    features: [
      'Laptops, desktops & monitors',
      'Priority 48-hour delivery',
      'Free setup & data migration',
      'Dedicated account manager',
      '10% Nuevo loyalty savings',
    ],
    cta: { label: 'Get Started', to: '/rent-products' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Bundle',
    tagline: 'Offices & institutions',
    showCountdown: true,
    prices: {
      weekly: { current: 2499, original: 3299 },
      monthly: { current: 8999, original: 11999 },
      yearly: { current: 86300, original: 115000 },
    },
    features: [
      'Full office IT stack rental',
      'Bulk pricing on 25+ devices',
      'Same-day delivery in Pune',
      '24/7 priority support',
      'Free annual hardware refresh',
    ],
    cta: { label: 'Get Quote', to: '/contact' },
  },
]

const PRICING_POINTS = [
  'Choose rental durations that suit your budget.',
  'Short-term rentals for events & projects.',
  'Long-term plans for businesses & professionals.',
  'Longer duration = lower monthly cost.',
]

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getDiscountPercent(current, original) {
  return Math.round(((original - current) / original) * 100)
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="rgba(74, 144, 226, 0.18)" />
      <path
        d="M5 8L7 10L11 6"
        stroke="#4a90e2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

function getTimeLeft(targetDate) {
  const diff = Math.max(0, targetDate - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function CountdownBadge({ targetDate }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate)

  return (
    <div className="pricing-countdown-badge" aria-live="polite">
      <span className="pricing-countdown-badge-label">Limited offer ends in</span>
      <div className="pricing-countdown-units">
        <span><strong>{String(days).padStart(2, '0')}</strong>d</span>
        <span><strong>{String(hours).padStart(2, '0')}</strong>h</span>
        <span><strong>{String(minutes).padStart(2, '0')}</strong>m</span>
        <span><strong>{String(seconds).padStart(2, '0')}</strong>s</span>
      </div>
    </div>
  )
}

function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [priceKey, setPriceKey] = useState(0)
  const offerEnd = new Date()
  offerEnd.setDate(offerEnd.getDate() + 12)
  offerEnd.setHours(23, 59, 59, 999)

  const activeCycle = BILLING_CYCLES.find((cycle) => cycle.id === billingCycle) ?? BILLING_CYCLES[1]

  const handleCycleChange = (cycleId) => {
    setBillingCycle(cycleId)
    setPriceKey((prev) => prev + 1)
  }

  return (
    <section className="page-section pricing-page" aria-labelledby="pricing-heading">
      <div className="pricing-page-bg" aria-hidden="true">
        <div className="pricing-page-grid" />
        <div className="pricing-page-glow pricing-page-glow--left" />
        <div className="pricing-page-glow pricing-page-glow--center" />
        <div className="pricing-page-glow pricing-page-glow--right" />
        <div className="pricing-page-ring pricing-page-ring--one" />
        <div className="pricing-page-ring pricing-page-ring--two" />
      </div>

      <div className="page-section-inner pricing-page-inner">
        <header className="pricing-hero page-animate-item">
          <span className="pricing-eyebrow">Rental Pricing</span>
          <h1 id="pricing-heading" className="pricing-title">Choose Your Rental Plan</h1>
          <p className="pricing-lead">
            Flexible weekly, monthly, and yearly rentals with transparent pricing and exclusive savings.
          </p>
        </header>

        <div className="pricing-toggle-wrap page-animate-item">
          <div className="pricing-toggle" role="tablist" aria-label="Billing cycle">
            {BILLING_CYCLES.map((cycle) => (
              <button
                key={cycle.id}
                type="button"
                role="tab"
                aria-selected={billingCycle === cycle.id}
                className={`pricing-toggle-btn${billingCycle === cycle.id ? ' pricing-toggle-btn--active' : ''}`}
                onClick={() => handleCycleChange(cycle.id)}
              >
                {cycle.label}
                {cycle.id === 'yearly' && <span className="pricing-toggle-save">Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="pricing-cards">
          {PRICING_TIERS.map((tier, index) => {
            const price = tier.prices[billingCycle]
            const discount = getDiscountPercent(price.current, price.original)

            return (
              <article
                key={tier.id}
                className={`pricing-card${tier.featured ? ' pricing-card--featured' : ''}`}
                style={{ '--pricing-card-delay': `${0.15 + index * 0.12}s` }}
              >
                {tier.featured && <span className="pricing-card-popular">Most Popular</span>}
                {tier.showCountdown && billingCycle === 'yearly' && (
                  <CountdownBadge targetDate={offerEnd.getTime()} />
                )}

                <div className="pricing-card-head">
                  <h2 className="pricing-card-name">{tier.name}</h2>
                  <p className="pricing-card-tagline">{tier.tagline}</p>
                </div>

                <div key={priceKey} className="pricing-card-price-block">
                  <div className="pricing-card-price-row">
                    <span className="pricing-card-price">{formatPrice(price.current)}</span>
                    <span className="pricing-card-original">{formatPrice(price.original)}</span>
                    <span className="pricing-card-discount">{discount}% OFF</span>
                  </div>
                  <p className="pricing-card-billing">
                    Billed {activeCycle.label.toLowerCase()}
                    <span>{activeCycle.suffix}</span>
                  </p>
                </div>

                <Link to={tier.cta.to} className="pricing-card-cta">
                  <span className="pricing-card-cta-icon" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                  {tier.cta.label}
                </Link>

                <ul className="pricing-card-features">
                  {tier.features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        <ul className="pricing-points">
          {PRICING_POINTS.map((point, index) => (
            <li key={point} className="page-animate-item" style={{ animationDelay: `${0.55 + index * 0.08}s` }}>
              {point}
            </li>
          ))}
        </ul>

        <div className="pricing-savings page-animate-item">
          <span className="pricing-savings-icon" aria-hidden="true">↓</span>
          <p>Longer duration = lower monthly cost — switch to yearly for maximum savings.</p>
        </div>

        <div className="pricing-cta page-animate-item">
          <Link to="/rent-products" className="pricing-btn pricing-btn--primary">
            Browse All Products
          </Link>
          <Link to="/contact" className="pricing-btn pricing-btn--ghost">
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PricingPage
