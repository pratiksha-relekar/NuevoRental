import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './CorporatePage.css'

const STATS = [
  { value: '500+', label: 'Corporate Clients' },
  { value: '10K+', label: 'Devices Deployed' },
  { value: '48hr', label: 'Avg. Deployment' },
  { value: '25+', label: 'Cities Covered' },
]

const SOLUTIONS = [
  {
    icon: '🏢',
    title: 'Office Setup',
    description: 'Complete IT infrastructure for new offices, expansions, and co-working spaces without capital expenditure.',
    tags: ['Laptops', 'Desktops', 'Monitors'],
  },
  {
    icon: '🚀',
    title: 'Project & Events',
    description: 'Short-term rentals for conferences, training programs, product launches, and on-site deployments.',
    tags: ['Weekly', 'Monthly', 'Bulk'],
  },
  {
    icon: '🎓',
    title: 'Institutions',
    description: 'Scalable device programs for schools, colleges, and training centres with flexible tenure options.',
    tags: ['Tablets', 'Labs', 'Printers'],
  },
  {
    icon: '💼',
    title: 'Remote Teams',
    description: 'Equip distributed teams with pre-configured laptops delivered to multiple locations across India.',
    tags: ['Pan-India', 'KYC', 'Support'],
  },
]

const BENEFITS = [
  {
    title: 'Bulk pricing discounts',
    description: 'Save up to 30% on orders of 25+ devices with tiered corporate rates.',
  },
  {
    title: 'Dedicated account manager',
    description: 'A single point of contact for orders, renewals, and escalations.',
  },
  {
    title: 'GST billing',
    description: 'Compliant invoices with GSTIN for seamless finance and audit workflows.',
  },
  {
    title: 'Flexible tenure',
    description: 'Weekly, monthly, or yearly plans — scale up or down as your team changes.',
  },
  {
    title: 'Quick deployment',
    description: 'Same-day and 48-hour delivery options available in major cities.',
  },
  {
    title: 'Pan-India support',
    description: 'Pickup, replacement, and technical support across 25+ service locations.',
  },
]

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Share Requirements',
    description: 'Tell us device count, specs, tenure, and delivery locations.',
  },
  {
    step: '02',
    title: 'Get Custom Quote',
    description: 'Receive a tailored proposal with bulk pricing within 24 hours.',
  },
  {
    step: '03',
    title: 'KYC & Agreement',
    description: 'Complete quick verification and sign a transparent rental agreement.',
  },
  {
    step: '04',
    title: 'Deploy & Support',
    description: 'We deliver, set up, and provide ongoing maintenance & replacements.',
  },
]

const INDUSTRIES = [
  'IT & Software',
  'BFSI',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Startups',
  'Events & Media',
  'Government',
]

const TRUST_ITEMS = [
  'Zero upfront hardware cost',
  'Refurbished & new devices',
  'Free pickup on return',
  'ISO-compliant processes',
]

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="rgba(74, 144, 226, 0.12)" />
      <path
        d="M5.5 9L7.5 11L12.5 6.5"
        stroke="#4a90e2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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

function CorporatePage() {
  return (
    <section className="page-section corporate-page" aria-labelledby="corporate-heading">
      <div className="corporate-page-bg" aria-hidden="true">
        <div className="corporate-page-grid" />
        <div className="corporate-page-glow corporate-page-glow--left" />
        <div className="corporate-page-glow corporate-page-glow--right" />
        <div className="corporate-page-shape corporate-page-shape--one" />
        <div className="corporate-page-shape corporate-page-shape--two" />
      </div>

      <div className="page-section-inner corporate-page-inner">
        <header className="corporate-hero">
          <span className="corporate-eyebrow page-animate-item">Corporate Rentals</span>
          <h1 id="corporate-heading" className="corporate-title page-animate-item">
            Smart Rental Solutions for Businesses
          </h1>
          <p className="corporate-lead page-animate-item">
            Equip your team without heavy investments. Rent laptops, desktops, printers,
            and IT equipment for offices, projects, or events — with enterprise-grade support.
          </p>
        </header>

        <div className="corporate-stats">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="corporate-stat-card"
              style={{ '--corp-delay': `${0.1 + index * 0.08}s` }}
            >
              <span className="corporate-stat-value">{stat.value}</span>
              <span className="corporate-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="corporate-trust-strip">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="corporate-trust-item">
              <CheckIcon />
              {item}
            </span>
          ))}
        </div>

        <section className="corporate-section" aria-labelledby="corporate-solutions-heading">
          <div className="corporate-section-head">
            <h2 id="corporate-solutions-heading" className="corporate-section-title">
              Solutions for Every Business Need
            </h2>
            <p className="corporate-section-desc">
              From a single laptop to a full office rollout — we tailor rentals to your scale and timeline.
            </p>
          </div>

          <div className="corporate-solutions-grid">
            {SOLUTIONS.map((solution, index) => (
              <article
                key={solution.title}
                className="corporate-solution-card"
                style={{ '--corp-delay': `${0.12 + index * 0.1}s` }}
              >
                <span className="corporate-solution-icon" aria-hidden="true">{solution.icon}</span>
                <h3 className="corporate-solution-title">{solution.title}</h3>
                <p className="corporate-solution-desc">{solution.description}</p>
                <div className="corporate-solution-tags">
                  {solution.tags.map((tag) => (
                    <span key={tag} className="corporate-solution-tag">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="corporate-split">
          <div className="corporate-intro-panel">
            <h2 className="corporate-panel-title">Why Nuevo for Corporate?</h2>
            <p className="corporate-panel-lead">
              We help businesses stay agile — upgrade technology without locking capital
              in depreciating assets. Pay only for what you use, when you use it.
            </p>
            <ul className="corporate-highlight-list">
              <li>
                <strong>CAPEX to OPEX</strong>
                <span>Convert hardware spend into predictable monthly rentals.</span>
              </li>
              <li>
                <strong>Scale on demand</strong>
                <span>Add or return devices as your headcount changes.</span>
              </li>
              <li>
                <strong>Always current</strong>
                <span>Refresh hardware every 12–24 months with zero hassle.</span>
              </li>
            </ul>
            <Link to="/pricing" className="corporate-inline-link">
              View pricing plans
              <ArrowIcon />
            </Link>
          </div>

          <div className="corporate-benefits">
            <h2 className="corporate-benefits-title">Enterprise Benefits</h2>
            <ul className="corporate-benefits-list">
              {BENEFITS.map((benefit, index) => (
                <li
                  key={benefit.title}
                  className="corporate-benefit-item"
                  style={{ '--corp-delay': `${0.08 + index * 0.06}s` }}
                >
                  <span className="corporate-check" aria-hidden="true">✔</span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="corporate-section" aria-labelledby="corporate-process-heading">
          <div className="corporate-section-head">
            <h2 id="corporate-process-heading" className="corporate-section-title">
              How It Works
            </h2>
            <p className="corporate-section-desc">
              A simple four-step process from enquiry to fully deployed IT — handled by our corporate team.
            </p>
          </div>

          <ol className="corporate-process">
            {PROCESS_STEPS.map((item, index) => (
              <li
                key={item.step}
                className="corporate-process-step"
                style={{ '--corp-delay': `${0.1 + index * 0.1}s` }}
              >
                <span className="corporate-process-num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="corporate-industries" aria-labelledby="corporate-industries-heading">
          <h2 id="corporate-industries-heading" className="corporate-section-title">
            Industries We Serve
          </h2>
          <div className="corporate-industries-list">
            {INDUSTRIES.map((industry, index) => (
              <span
                key={industry}
                className="corporate-industry-chip"
                style={{ '--corp-delay': `${0.05 + index * 0.04}s` }}
              >
                {industry}
              </span>
            ))}
          </div>
        </section>

        <div className="corporate-cta-banner">
          <div className="corporate-cta-content">
            <h2>Ready to equip your team?</h2>
            <p>
              Get a custom corporate quote within 24 hours. No commitment required —
              our experts will help you find the right devices and tenure.
            </p>
          </div>
          <div className="corporate-cta">
            <Link to="/contact" className="corporate-btn corporate-btn--primary">
              Request Quote
            </Link>
            <a href="tel:8080808964" className="corporate-btn corporate-btn--ghost">
              Talk to Expert
            </a>
            <Link to="/rent-products" className="corporate-btn corporate-btn--outline">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CorporatePage
