import { Link } from 'react-router-dom'
import SpotlightCard from './SpotlightCard'
import Strands from './Strands'
import './AboutUs.css'

const STATS = [
  { value: '10+', label: 'Years of Trust' },
  { value: '500+', label: 'Business Clients' },
  { value: '25+', label: 'Metro Cities' },
  { value: '10K+', label: 'Devices Rented' },
]

const SERVICES = [
  {
    icon: '💻',
    title: 'Laptops & MacBooks',
    description: 'For business, education, development, design, and remote work.',
  },
  {
    icon: '🖥️',
    title: 'Desktops & Workstations',
    description: 'Ideal for offices, editing, design, and high-performance tasks.',
  },
  {
    icon: '🖨️',
    title: 'Printers & Scanners',
    description: 'Laser, inkjet, and multi-function devices for office and event needs.',
  },
  {
    icon: '📽️',
    title: 'Projectors & Displays',
    description: 'Perfect for meetings, training sessions, conferences, and exhibitions.',
  },
  {
    icon: '🌐',
    title: 'Networking & Accessories',
    description: 'Routers, UPS systems, webcams, keyboards, mice, and more.',
  },
]

const AUDIENCES = [
  'Startups & growing businesses',
  'Corporates & enterprises',
  'Training institutes & educational centers',
  'Event & exhibition organizers',
  'Remote workers & freelancers',
  'Students & professionals',
  'Production houses & creative teams',
]

const PILLARS = [
  {
    number: '01',
    title: 'Convenience',
    description:
      'From browsing to booking, KYC, payment, and delivery — everything is designed to be smooth and digital-first.',
  },
  {
    number: '02',
    title: 'Reliability',
    description:
      'Quality checks, quick replacements, and support when you need it — because our devices power important work.',
  },
  {
    number: '03',
    title: 'Flexibility',
    description:
      'Daily, monthly, or long-term rentals. Scale up, scale down, or upgrade — your plan adapts with you.',
  },
]

const TRUST_POINTS = [
  'Pan-India metro city coverage',
  'Transparent and fair pricing',
  'Quick online KYC process',
  'Doorstep delivery & setup',
  'Maintenance and replacement support',
  'GST invoices for businesses',
  'Flexible rental durations',
  'Dedicated customer assistance',
  'Bulk & corporate solutions',
]

const VALUES = [
  {
    title: 'Customer First',
    description: 'Every decision we make starts with customer benefit.',
  },
  {
    title: 'Transparency',
    description: 'Clear pricing, clear terms, no hidden surprises.',
  },
  {
    title: 'Quality',
    description: 'Devices and service standards we are proud to deliver.',
  },
  {
    title: 'Innovation',
    description: 'We continuously improve our processes and technology.',
  },
  {
    title: 'Responsibility',
    description: 'Promoting shared and rental-based technology access for sustainability.',
  },
]

function AboutUs() {
  return (
    <section className="about-us" aria-labelledby="about-heading">
      <div className="about-page-bg" aria-hidden="true">
        <div className="about-page-grid" />
        <div className="about-page-glow about-page-glow--left" />
        <div className="about-page-glow about-page-glow--right" />
      </div>

      <div className="about-us-inner">
        <header className="about-hero">
          <span className="about-eyebrow about-reveal">About Nuevo Rental</span>
          <h1 id="about-heading" className="about-title about-reveal about-reveal--delay-1">
            Powering Work, Ideas &amp; Growth — One Device at a Time
          </h1>
          <p className="about-lead about-reveal about-reveal--delay-2">
            Nuevo Rental is a trusted electronics and IT equipment rental service built for today&apos;s
            fast-changing world. We provide laptops, desktops, printers, projectors, and a wide range
            of technology solutions on flexible rental plans across India&apos;s major metro cities.
          </p>
        </header>

        <div className="about-stats">
          {STATS.map((stat, index) => (
            <SpotlightCard
              key={stat.label}
              className={`about-stat-card about-reveal about-reveal--delay-${index + 2}`}
              spotlightColor="rgba(74, 144, 226, 0.2)"
            >
              <span className="about-stat-value">{stat.value}</span>
              <span className="about-stat-label">{stat.label}</span>
            </SpotlightCard>
          ))}
        </div>

        <div className="about-intro-grid">
          <SpotlightCard
            className="about-intro-card about-reveal"
            spotlightColor="rgba(74, 144, 226, 0.16)"
          >
            <h2 className="about-section-title">Why We Exist</h2>
            <p>
              We help businesses and individuals access technology affordably without ownership burden.
              Our focus is reliability, transparency, and customer satisfaction.
            </p>
            <p>
              In a time where technology evolves rapidly and businesses must stay agile, owning devices
              is not always the smartest option. Nuevo Rental was created to offer a better alternative
              — access to the latest technology without the burden of ownership, high upfront costs, or
              maintenance worries.
            </p>
            <p className="about-highlight">
              We believe technology should enable progress, not slow it down.
            </p>
          </SpotlightCard>

          <SpotlightCard
            className="about-intro-card card-spotlight--accent about-reveal about-reveal--delay-1"
            spotlightColor="rgba(43, 143, 232, 0.2)"
          >
            <h2 className="about-section-title">Our Story</h2>
            <p>
              Nuevo Rental was founded with a simple observation: businesses and individuals often need
              high-quality devices, but not always permanently. Startups scale up and down. Events need
              temporary setups. Professionals work remotely. Students need short-term access to powerful
              systems.
            </p>
            <p>
              Buying equipment for short-term or changing needs often leads to unnecessary expenses and
              underutilized assets.
            </p>
            <p>
              Nuevo Rental was born to solve this gap — by creating a reliable, transparent, and
              professional rental ecosystem for electronics and IT equipment.
            </p>
            <p>
              Today, we proudly serve startups, corporates, institutions, event organizers, and
              individuals who rely on us for dependable technology solutions.
            </p>
          </SpotlightCard>
        </div>

        <section className="about-block" aria-labelledby="about-services-heading">
          <div className="about-block-header about-reveal">
            <span className="about-block-tag">What We Do</span>
            <h2 id="about-services-heading" className="about-section-title">
              Technology Rentals, Done Right
            </h2>
            <p>
              We provide ready-to-use, professionally tested, and business-grade devices for rent.
              Each device is carefully inspected, sanitized, and performance-tested before delivery.
            </p>
          </div>

          <div className="about-services-grid">
            {SERVICES.map((service, index) => (
              <SpotlightCard
                key={service.title}
                className={`about-service-card about-reveal about-reveal--delay-${(index % 4) + 1}`}
                spotlightColor="rgba(74, 144, 226, 0.14)"
              >
                <span className="about-service-icon" aria-hidden="true">{service.icon}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <section
          className="about-audience-wrap about-reveal"
          aria-labelledby="about-audience-heading"
        >
          <div className="about-audience-strands" aria-hidden="true">
            <Strands
              colors={['#4a90e2', '#2b8fe8', '#c2557a', '#6eb5ff']}
              count={4}
              speed={0.22}
              amplitude={1.15}
              waviness={0.9}
              thickness={0.72}
              glow={2.8}
              taper={2.4}
              spread={1.2}
              intensity={0.62}
              saturation={1.4}
              opacity={1}
              scale={1.15}
            />
          </div>
          <div className="about-audience-overlay" aria-hidden="true" />
          <div className="about-audience-content">
            <div className="about-block-header">
              <span className="about-block-tag about-block-tag--light">Who We Serve</span>
              <h2 id="about-audience-heading" className="about-section-title">
                Built for Every Kind of Team
              </h2>
              <p>
                Whether it is one device or hundreds, short-term or long-term, we provide scalable
                solutions for every type of customer.
              </p>
            </div>

            <div className="about-audience-grid">
              <ul className="about-audience-list">
                {AUDIENCES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <Link to="/rent-products" className="about-cta-btn">
              Explore Rental Products
            </Link>
          </div>
        </section>

        <section className="about-block" aria-labelledby="about-pillars-heading">
          <div className="about-block-header about-reveal">
            <span className="about-block-tag">Our Approach</span>
            <h2 id="about-pillars-heading" className="about-section-title">
              Three Pillars of Excellence
            </h2>
            <p>Everything we do is guided by convenience, reliability, and flexibility.</p>
          </div>

          <div className="about-pillars-grid">
            {PILLARS.map((pillar, index) => (
              <SpotlightCard
                key={pillar.title}
                className={`about-pillar-card about-reveal about-reveal--delay-${index + 1}`}
                spotlightColor={index === 1 ? 'rgba(194, 85, 122, 0.14)' : 'rgba(74, 144, 226, 0.16)'}
              >
                <span className="about-pillar-number">{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <SpotlightCard
          className="about-block about-block--trust about-reveal"
          spotlightColor="rgba(74, 144, 226, 0.12)"
        >
          <div className="about-block-header">
            <span className="about-block-tag">Why Trust Us</span>
            <h2 className="about-section-title">Why Businesses Trust Nuevo Rental</h2>
            <p>We aim to build long-term relationships, not just short-term rentals.</p>
          </div>

          <ul className="about-trust-list">
            {TRUST_POINTS.map((point) => (
              <li key={point}>
                <span className="about-trust-check" aria-hidden="true">✔</span>
                {point}
              </li>
            ))}
          </ul>
        </SpotlightCard>

        <div className="about-mission-grid">
          <SpotlightCard
            className="about-mission-card about-reveal"
            spotlightColor="rgba(74, 144, 226, 0.15)"
          >
            <span className="about-mission-icon" aria-hidden="true">🎯</span>
            <h2 className="about-section-title">Our Mission</h2>
            <p>
              To make technology accessible, affordable, and flexible for everyone — from individuals
              to large organizations — through smart rental solutions.
            </p>
          </SpotlightCard>

          <SpotlightCard
            className="about-mission-card about-mission-card--vision about-reveal about-reveal--delay-1"
            spotlightColor="rgba(74, 144, 226, 0.28)"
          >
            <span className="about-mission-icon" aria-hidden="true">🔭</span>
            <h2 className="about-section-title">Our Vision</h2>
            <p>
              To become India&apos;s most trusted and preferred electronics rental platform, known for
              service quality, reliability, and customer-first solutions.
            </p>
          </SpotlightCard>
        </div>

        <section className="about-block" aria-labelledby="about-values-heading">
          <div className="about-block-header about-reveal">
            <span className="about-block-tag">Our Values</span>
            <h2 id="about-values-heading" className="about-section-title">
              What We Stand For
            </h2>
          </div>

          <div className="about-values-grid">
            {VALUES.map((value, index) => (
              <SpotlightCard
                key={value.title}
                className={`about-value-card card-spotlight--pink about-reveal about-reveal--delay-${(index % 3) + 1}`}
                spotlightColor="rgba(194, 85, 122, 0.14)"
              >
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <SpotlightCard
          className="about-looking-ahead about-reveal"
          spotlightColor="rgba(74, 144, 226, 0.12)"
        >
          <h2 className="about-section-title">Looking Ahead</h2>
          <p>
            As work styles evolve and digital needs grow, Nuevo Rental is committed to expanding its
            reach, improving service speed, and offering smarter rental solutions.
          </p>
          <p>
            We are building not just a rental platform, but a dependable technology partner for our
            customers.
          </p>
        </SpotlightCard>

        <SpotlightCard
          className="about-promise about-reveal"
          spotlightColor="rgba(74, 144, 226, 0.22)"
        >
          <h2 className="about-section-title">Our Promise</h2>
          <p className="about-promise-lead">At Nuevo Rental, we don&apos;t just rent devices.</p>
          <p>We support ambitions, projects, businesses, and dreams.</p>
          <p>
            When you rent from us, you get more than equipment — you get reliability, support, and
            peace of mind.
          </p>
          <p className="about-promise-tagline">
            To be India&apos;s most trusted electronics rental platform.
          </p>
          <div className="about-promise-actions">
            <Link to="/contact" className="about-cta-btn about-cta-btn--primary">
              Get in Touch
            </Link>
            <Link to="/corporate" className="about-cta-btn about-cta-btn--ghost">
              Corporate Rentals
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </section>
  )
}

export default AboutUs
