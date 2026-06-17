import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './PricingPage.css'

const PRICING_POINTS = [
  'Choose rental durations that suit your budget.',
  'Short-term rentals for events.',
  'Long-term plans for businesses & professionals.',
  'Longer duration = Lower monthly cost.',
]

const PLANS = [
  {
    name: 'Daily',
    tagline: 'Events & short projects',
    highlight: 'Pay per day',
    description: 'Ideal for conferences, exhibitions, training sessions, and one-off requirements.',
  },
  {
    name: 'Monthly',
    tagline: 'Most popular',
    highlight: 'Best flexibility',
    featured: true,
    description: 'Perfect for startups, remote teams, and professionals who need reliable monthly access.',
  },
  {
    name: 'Long-Term',
    tagline: 'Business & corporate',
    highlight: 'Lowest monthly cost',
    description: 'Designed for offices, institutions, and enterprises with ongoing technology needs.',
  },
]

function PricingPage() {
  return (
    <section className="page-section pricing-page" aria-labelledby="pricing-heading">
      <div className="page-section-inner">
        <header className="pricing-header">
          <span className="page-eyebrow">Rental Pricing</span>
          <h1 id="pricing-heading" className="page-title">Flexible Plans for Every Need</h1>
        </header>

        <ul className="pricing-points">
          {PRICING_POINTS.map((point) => (
            <li key={point} className="page-animate-item">{point}</li>
          ))}
        </ul>

        <div className="pricing-plans">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-plan-card page-animate-item${plan.featured ? ' pricing-plan-card--featured' : ''}`}
            >
              {plan.featured && <span className="pricing-plan-badge">Popular</span>}
              <h2>{plan.name}</h2>
              <p className="pricing-plan-tagline">{plan.tagline}</p>
              <p className="pricing-plan-highlight">{plan.highlight}</p>
              <p className="pricing-plan-desc">{plan.description}</p>
            </article>
          ))}
        </div>

        <div className="pricing-savings page-animate-item">
          <span className="pricing-savings-icon" aria-hidden="true">↓</span>
          <p>Longer duration = Lower monthly cost</p>
        </div>

        <div className="pricing-cta page-animate-item">
          <Link to="/rent-products" className="pricing-btn pricing-btn--primary">
            View Plans
          </Link>
          <Link to="/contact" className="pricing-btn pricing-btn--ghost">
            Get Quote
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PricingPage
