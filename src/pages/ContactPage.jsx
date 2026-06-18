import { Link } from 'react-router-dom'
import Lightfall from '../components/Lightfall'
import '../styles/pageAnimations.css'
import './ContactPage.css'

const CONTACT_CHANNELS = [
  {
    icon: '📞',
    label: 'Phone',
    value: '8080808964',
    href: 'tel:8080808964',
    detail: 'Mon–Sat, 9am – 7pm IST',
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'support@nuevorental.com',
    href: 'mailto:support@nuevorental.com',
    detail: 'Replies within 24 hours',
  },
  {
    icon: '💬',
    label: 'WhatsApp',
    value: 'Chat with Us',
    href: 'https://wa.me/911234567890',
    detail: 'Quick rental queries',
    external: true,
  },
]

const HELP_TOPICS = [
  {
    icon: '🏢',
    title: 'Corporate & Bulk Rentals',
    description: 'Office setups, 25+ devices, GST billing, and dedicated account managers.',
    link: '/corporate',
  },
  {
    icon: '📦',
    title: 'Delivery & Setup',
    description: 'Doorstep delivery, device configuration, and on-site installation in major cities.',
    link: '/locations',
  },
  {
    icon: '📋',
    title: 'KYC & Documentation',
    description: 'Help with identity verification, rental agreements, and business onboarding.',
    link: '/kyc',
  },
  {
    icon: '🔄',
    title: 'Extensions & Returns',
    description: 'Extend your rental tenure, schedule pickups, or swap devices mid-contract.',
    link: '/rent-products',
  },
  {
    icon: '🛠️',
    title: 'Technical Support',
    description: 'Troubleshooting, replacements, and maintenance for rented laptops and IT gear.',
    link: '/support',
  },
  {
    icon: '💳',
    title: 'Billing & Invoices',
    description: 'GST invoices, payment plans, pricing queries, and corporate billing support.',
    link: '/pricing',
  },
]

const SERVICE_CITIES = [
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
]

const LIGHTFALL_PROPS = {
  colors: ['#4a90e2', '#8ec5ff', '#c2557a'],
  backgroundColor: '#121f38',
  speed: 0.4,
  streakCount: 4,
  streakWidth: 0.75,
  streakLength: 1,
  glow: 0.55,
  density: 0.45,
  twinkle: 0.35,
  zoom: 2.4,
  backgroundGlow: 0.3,
  opacity: 0.9,
  mouseInteraction: true,
  mouseStrength: 0.45,
  mouseRadius: 0.5,
  mouseDampening: 0.15,
}

function LightfallGridSection({ children, className = '', minHeight = 360 }) {
  return (
    <div className={`contact-lightfall-wrap ${className}`.trim()} style={{ minHeight }}>
      <div className="contact-lightfall-bg">
        <Lightfall {...LIGHTFALL_PROPS} />
      </div>
      <div className="contact-lightfall-overlay" aria-hidden="true" />
      <div className="contact-lightfall-content">{children}</div>
    </div>
  )
}

function ContactPage() {
  return (
    <section className="page-section contact-page" aria-labelledby="contact-heading">
      <div className="contact-page-bg" aria-hidden="true">
        <div className="contact-page-grid" />
        <div className="contact-page-glow contact-page-glow--left" />
        <div className="contact-page-glow contact-page-glow--right" />
      </div>

      <div className="page-section-inner contact-page-inner">
        <header className="contact-hero">
          <span className="contact-eyebrow contact-reveal">Get in Touch</span>
          <h1 id="contact-heading" className="contact-title contact-reveal contact-reveal--d1">
            Contact Nuevo Rental
          </h1>
          <p className="contact-lead contact-reveal contact-reveal--d2">
            Have questions about rentals, corporate orders, delivery, or device support?
            Our team is ready to help you find the right technology solution.
          </p>
        </header>

        <LightfallGridSection className="contact-reveal contact-reveal--d3" minHeight={340}>
          <div className="contact-section-head contact-section-head--on-dark">
            <span className="contact-section-tag">Direct Contact</span>
            <h2 className="contact-section-title">Reach Us Anytime</h2>
            <p>Call, email, or chat — pick the channel that works best for you.</p>
          </div>
          <div className="contact-channels-grid">
            {CONTACT_CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="contact-channel-card"
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="contact-channel-icon" aria-hidden="true">{channel.icon}</span>
                <span className="contact-channel-label">{channel.label}</span>
                <span className="contact-channel-value">{channel.value}</span>
                <span className="contact-channel-detail">{channel.detail}</span>
              </a>
            ))}
          </div>
        </LightfallGridSection>

        <div className="contact-split">
          <div className="contact-intro-panel contact-reveal">
            <span className="contact-section-tag">Rental Support</span>
            <h2 className="contact-section-title">We&apos;re Here to Help</h2>
            <p className="contact-intro-text">
              Whether you need a single laptop for a week or a full office IT rollout,
              Nuevo Rental provides end-to-end support from enquiry to delivery and beyond.
            </p>
            <ul className="contact-points">
              <li>Custom quotes for corporate &amp; bulk rentals</li>
              <li>Flexible weekly, monthly &amp; yearly plans</li>
              <li>Free doorstep delivery in service cities</li>
              <li>Quick online KYC &amp; transparent agreements</li>
              <li>GST invoices for business customers</li>
              <li>Device replacement &amp; maintenance support</li>
            </ul>
            <Link to="/rent-products" className="contact-btn contact-btn--primary">
              Browse Products
            </Link>
          </div>

          <form className="contact-form contact-reveal contact-reveal--d1" onSubmit={(e) => e.preventDefault()}>
            <h2 className="contact-form-title">Send a Message</h2>
            <p className="contact-form-desc">Fill in your details and we&apos;ll get back to you shortly.</p>
            <div className="contact-form-row">
              <label className="contact-field">
                <span>Full Name</span>
                <input type="text" name="name" placeholder="Your name" autoComplete="name" />
              </label>
              <label className="contact-field">
                <span>Phone</span>
                <input type="tel" name="phone" placeholder="10-digit mobile" autoComplete="tel" />
              </label>
            </div>
            <label className="contact-field">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@company.com" autoComplete="email" />
            </label>
            <label className="contact-field">
              <span>Inquiry Type</span>
              <select name="topic" defaultValue="rental">
                <option value="rental">Product Rental</option>
                <option value="corporate">Corporate / Bulk Order</option>
                <option value="delivery">Delivery &amp; Setup</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing &amp; Invoice</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="contact-field">
              <span>Message</span>
              <textarea name="message" rows={4} placeholder="Tell us about your rental needs..." />
            </label>
            <button type="submit" className="contact-btn contact-btn--primary contact-btn--full">
              Submit Inquiry
            </button>
          </form>
        </div>

        <section className="contact-panel contact-reveal">
          <div className="contact-section-head">
            <span className="contact-section-tag">How Can We Help?</span>
            <h2 className="contact-section-title">Rental Support Topics</h2>
            <p>Quick answers and dedicated support for every stage of your rental journey.</p>
          </div>
          <div className="contact-help-grid">
            {HELP_TOPICS.map((topic) => (
              <Link key={topic.title} to={topic.link} className="contact-help-card">
                <span className="contact-help-icon" aria-hidden="true">{topic.icon}</span>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <span className="contact-help-link">Learn more →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="contact-cities contact-reveal" aria-labelledby="contact-cities-heading">
          <div className="contact-section-head">
            <span className="contact-section-tag">Service Areas</span>
            <h2 id="contact-cities-heading" className="contact-section-title">
              Pan-India Metro Coverage
            </h2>
            <p>We deliver and support rentals across India&apos;s major cities.</p>
          </div>
          <div className="contact-cities-list">
            {SERVICE_CITIES.map((city) => (
              <span key={city} className="contact-city-chip">{city}</span>
            ))}
            <Link to="/locations" className="contact-city-chip contact-city-chip--more">
              View all locations →
            </Link>
          </div>
        </section>

        <section className="contact-panel contact-panel--cta contact-cta-wrap contact-reveal">
          <div className="contact-cta-banner">
            <div>
              <h2>Need a custom corporate quote?</h2>
              <p>Get tailored pricing for bulk rentals, office setups, and long-term contracts.</p>
            </div>
            <div className="contact-cta-actions">
              <Link to="/corporate" className="contact-btn contact-btn--primary">
                Corporate Rentals
              </Link>
              <a href="tel:8080808964" className="contact-btn contact-btn--outline">
                Call Now
              </a>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ContactPage
