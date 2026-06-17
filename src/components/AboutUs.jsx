import './AboutUs.css'
import { Link } from 'react-router-dom'

const SERVICES = [
  {
    title: 'Laptops & MacBooks',
    description: 'For business, education, development, design, and remote work.',
  },
  {
    title: 'Desktops & Workstations',
    description: 'Ideal for offices, editing, design, and high-performance tasks.',
  },
  {
    title: 'Printers & Scanners',
    description: 'Laser, inkjet, and multi-function devices for office and event needs.',
  },
  {
    title: 'Projectors & Display Solutions',
    description: 'Perfect for meetings, training sessions, conferences, and exhibitions.',
  },
  {
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
    number: '1',
    title: 'Convenience',
    description:
      'From browsing to booking, KYC, payment, and delivery — everything is designed to be smooth and digital-first.',
  },
  {
    number: '2',
    title: 'Reliability',
    description:
      'We understand that our devices often power important work. That\'s why we ensure quality checks, quick replacements, and support when needed.',
  },
  {
    number: '3',
    title: 'Flexibility',
    description:
      'Customers can choose durations that match their needs — daily, monthly, or long-term rentals. Upgrades and extensions are always possible.',
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
    description: 'We support sustainable usage by promoting shared and rental-based technology access.',
  },
]

function AboutUs() {
  return (
    <section className="about-us" aria-labelledby="about-heading">
      <div className="about-us-inner">
        <header className="about-hero">
          <span className="about-eyebrow">About Nuevo Rental</span>
          <h1 id="about-heading" className="about-title">
            Powering Work, Ideas &amp; Growth — One Device at a Time
          </h1>
          <p className="about-lead">
            Nuevo Rental is a trusted electronics and IT equipment rental service built for today&apos;s
            fast-changing world. We provide laptops, desktops, printers, projectors, and a wide range
            of technology solutions on flexible rental plans across India&apos;s major metro cities.
          </p>
        </header>

        <div className="about-intro-grid">
          <div className="about-intro-card">
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
          </div>

          <div className="about-intro-card about-intro-card--accent">
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
          </div>
        </div>

        <div className="about-block">
          <div className="about-block-header">
            <h2 className="about-section-title">What We Do</h2>
            <p>
              We provide ready-to-use, professionally tested, and business-grade devices for rent.
              Each device is carefully inspected, sanitized, and performance-tested before delivery.
            </p>
          </div>

          <div className="about-services-grid">
            {SERVICES.map((service) => (
              <article key={service.title} className="about-service-card">
                <span className="about-service-check" aria-hidden="true">✔</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="about-block about-block--audience">
          <div className="about-block-header">
            <h2 className="about-section-title">Who We Serve</h2>
            <p>
              Nuevo Rental supports a wide range of customers. Whether it is one device or hundreds,
              short-term or long-term, we provide scalable solutions.
            </p>
          </div>

          <ul className="about-audience-list">
            {AUDIENCES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Link to="/rent-products" className="about-cta-btn">Explore Rental Products</Link>
        </div>

        <div className="about-block">
          <div className="about-block-header">
            <h2 className="about-section-title">Our Approach</h2>
            <p>We focus on three pillars:</p>
          </div>

          <div className="about-pillars-grid">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="about-pillar-card">
                <span className="about-pillar-number">{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="about-block about-block--trust">
          <div className="about-block-header">
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
        </div>

        <div className="about-mission-grid">
          <article className="about-mission-card">
            <h2 className="about-section-title">Our Mission</h2>
            <p>
              To make technology accessible, affordable, and flexible for everyone — from individuals
              to large organizations — through smart rental solutions.
            </p>
          </article>

          <article className="about-mission-card about-mission-card--vision">
            <h2 className="about-section-title">Our Vision</h2>
            <p>
              To become India&apos;s most trusted and preferred electronics rental platform, known for
              service quality, reliability, and customer-first solutions.
            </p>
          </article>
        </div>

        <div className="about-block">
          <div className="about-block-header">
            <h2 className="about-section-title">Our Values</h2>
          </div>

          <div className="about-values-grid">
            {VALUES.map((value) => (
              <article key={value.title} className="about-value-card">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>

        <article className="about-looking-ahead">
          <h2 className="about-section-title">Looking Ahead</h2>
          <p>
            As work styles evolve and digital needs grow, Nuevo Rental is committed to expanding its
            reach, improving service speed, and offering smarter rental solutions.
          </p>
          <p>
            We are building not just a rental platform, but a dependable technology partner for our
            customers.
          </p>
        </article>

        <article className="about-promise">
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
        </article>
      </div>
    </section>
  )
}

export default AboutUs
