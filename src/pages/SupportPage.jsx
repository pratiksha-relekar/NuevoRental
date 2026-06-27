import { useState } from 'react'
import SpotlightCard from '../components/SpotlightCard'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
const QUICK_STATS = [
  { value: '< 24h', label: 'Ticket Response' },
  { value: '48hr', label: 'Replacement SLA' },
  { value: '9am–7pm', label: 'Support Hours' },
  { value: '25+', label: 'Service Cities' },
]

const SUPPORT_SERVICES = [
  {
    icon: '🔧',
    title: 'Repair Support',
    description: 'Remote troubleshooting and on-site repair for rented laptops, desktops, and printers.',
  },
  {
    icon: '🔄',
    title: 'Replacement Requests',
    description: 'Quick device swap if hardware fails — minimal downtime for your team.',
  },
  {
    icon: '⬆️',
    title: 'Upgrade Requests',
    description: 'Move to higher-spec devices or add more units as your project scales.',
  },
  {
    icon: '📍',
    title: 'Relocation Help',
    description: 'Transfer rentals to a new office address or city with coordinated logistics.',
  },
  {
    icon: '📦',
    title: 'Pickup Scheduling',
    description: 'Schedule hassle-free pickup when your rental ends or when returning devices.',
  },
  {
    icon: '💬',
    title: 'Live Assistance',
    description: 'Phone, email, and WhatsApp support for billing, KYC, and delivery queries.',
  },
]

const PRODUCT_SUPPORT = [
  { icon: '💻', label: 'Laptops & MacBooks' },
  { icon: '🖥️', label: 'Desktops & Workstations' },
  { icon: '🖨️', label: 'Printers & Scanners' },
  { icon: '📽️', label: 'Projectors & Displays' },
  { icon: '📱', label: 'Tablets & Mobiles' },
  { icon: '🌐', label: 'Networking & Accessories' },
]

const FAQ_ITEMS = [
  {
    question: 'How do I rent a device from Nuevo Rental?',
    answer:
      'Browse products on our website, select your rental duration (weekly, monthly, or yearly), complete quick online KYC, and confirm your order. Our team will deliver the device to your doorstep in a serviceable city.',
  },
  {
    question: 'What documents are required for KYC?',
    answer:
      'Individuals typically need a valid government ID (Aadhaar/PAN) and address proof. Businesses require GST certificate, company registration, and authorized signatory ID. Our KYC page lists full requirements.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Standard delivery is 2–3 business days in metro cities. Priority 48-hour delivery is available in Pune, Mumbai, Bengaluru, and Delhi NCR for select products and corporate orders.',
  },
  {
    question: 'Can I extend my rental period?',
    answer:
      'Yes. You can extend weekly, monthly, or yearly rentals from your dashboard or by contacting support before your current tenure ends. Extensions are subject to device availability.',
  },
  {
    question: 'What if my rented device stops working?',
    answer:
      'Raise a support ticket or call us. We provide remote troubleshooting first. If the issue cannot be resolved, we arrange a replacement device at no extra rental cost for covered hardware faults.',
  },
  {
    question: 'How do returns and pickups work?',
    answer:
      'When your rental ends, schedule a pickup from your dashboard or contact support. We collect devices from your location, inspect them, and close your rental agreement. Early returns may have minimum tenure terms.',
  },
  {
    question: 'Do you provide GST invoices for businesses?',
    answer:
      'Yes. All corporate and business customers receive GST-compliant invoices with your GSTIN for accounting and tax purposes. Mention your GST details during KYC or checkout.',
  },
  {
    question: 'Can I upgrade or swap my device mid-rental?',
    answer:
      'Yes. You can request an upgrade to a higher-spec model or swap to a different device type. Contact support with your order ID — we will coordinate pickup of the old device and delivery of the new one.',
  },
  {
    question: 'Which cities do you currently serve?',
    answer:
      'We serve major metro cities including Pune, Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, and Ahmedabad. Visit our Locations page for the full list and pincode availability.',
  },
  {
    question: 'Is there a security deposit?',
    answer:
      'A refundable security deposit may apply based on product type and rental tenure. Deposit amount is shown clearly before checkout. It is refunded after device return and successful inspection.',
  },
]

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index))
  }

  return (
    <div className="support-faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `support-faq-panel-${index}`
        const buttonId = `support-faq-button-${index}`

        return (
          <article
            key={item.question}
            className={`support-faq-item support-reveal${isOpen ? ' support-faq-item--open' : ''}`}
            style={{ '--support-delay': `${0.05 + index * 0.04}s` }}
          >
            <Button
              id={buttonId}
              type="button"
              variant="ghost"
              className="support-faq-question"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span>{item.question}</span>
              <span className="support-faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </Button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="support-faq-answer-wrap"
              hidden={!isOpen}
            >
              <p className="support-faq-answer">{item.answer}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SupportPage() {
  return (
    <section className="page-section support-page" aria-labelledby="support-heading">
      <div className="support-page-bg" aria-hidden="true">
        <div className="support-page-grid" />
        <div className="support-page-glow support-page-glow--left" />
        <div className="support-page-glow support-page-glow--right" />
      </div>

      <div className="page-section-inner support-page-inner">
        <header className="support-hero">
          <span className="support-eyebrow support-reveal">Customer Support</span>
          <h1 id="support-heading" className="support-title support-reveal support-reveal--d1">
            We&apos;re Here to Help
          </h1>
          <p className="support-lead support-reveal support-reveal--d2">
            Get expert assistance for rentals, device issues, upgrades, relocations, and billing.
            Our support team keeps your technology running smoothly.
          </p>
        </header>

        <div className="support-stats">
          {QUICK_STATS.map((stat, index) => (
            <SpotlightCard
              key={stat.label}
              className={`support-stat-card support-reveal support-reveal--d${index + 2}`}
              spotlightColor="rgba(74, 144, 226, 0.16)"
            >
              <span className="support-stat-value">{stat.value}</span>
              <span className="support-stat-label">{stat.label}</span>
            </SpotlightCard>
          ))}
        </div>

        <div className="support-intro-banner support-reveal support-reveal--d3">
          <div className="support-intro-copy">
            <h2 className="support-section-title">Need help with your rental?</h2>
            <p>
              Facing an issue? Need an upgrade, relocation, or replacement? Raise a ticket from your
              dashboard or reach out to our support team directly.
            </p>
          </div>
          <div className="support-intro-actions">
            <LinkButton to="/dashboard" variant="default" className="support-btn support-btn--primary">
              Raise Support Ticket
            </LinkButton>
            <LinkButton to="/contact" variant="outline" className="support-btn support-btn--ghost">
              Contact Support
            </LinkButton>
          </div>
        </div>

        <section className="support-block" aria-labelledby="support-services-heading">
          <div className="support-section-head support-reveal">
            <span className="support-section-tag">Our Services</span>
            <h2 id="support-services-heading" className="support-section-title">
              End-to-End Rental Support
            </h2>
            <p>From delivery to pickup — we support every stage of your rental journey.</p>
          </div>

          <div className="support-services-grid">
            {SUPPORT_SERVICES.map((service, index) => (
              <SpotlightCard
                key={service.title}
                className={`support-service-card support-reveal support-reveal--d${(index % 4) + 1}`}
                spotlightColor={index % 2 === 0 ? 'rgba(74, 144, 226, 0.14)' : 'rgba(194, 85, 122, 0.12)'}
              >
                <span className="support-service-icon" aria-hidden="true">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <section className="support-products support-reveal" aria-labelledby="support-products-heading">
          <div className="support-section-head support-section-head--light">
            <span className="support-section-tag support-section-tag--light">Product Support</span>
            <h2 id="support-products-heading" className="support-section-title">
              Devices We Support
            </h2>
            <p>Technical help available for all major rental categories.</p>
          </div>
          <div className="support-products-grid">
            {PRODUCT_SUPPORT.map((item) => (
              <span key={item.label} className="support-product-chip">
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="support-block support-faq-section" aria-labelledby="support-faq-heading">
          <div className="support-section-head support-reveal">
            <span className="support-section-tag">FAQ</span>
            <h2 id="support-faq-heading" className="support-section-title">
              Frequently Asked Questions
            </h2>
            <p>Quick answers about renting, delivery, KYC, returns, and device support.</p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </section>

        <SpotlightCard
          className="support-cta-banner support-reveal"
          spotlightColor="rgba(74, 144, 226, 0.18)"
        >
          <div className="support-cta-content">
            <h2>Still have questions?</h2>
            <p>
              Our support team is available Monday to Saturday, 9am – 7pm IST.
              Call us or send a message — we typically respond within 24 hours.
            </p>
          </div>
          <div className="support-cta-actions">
            <Button
              render={<a href="tel:8080808964" />}
              variant="default"
              className="support-btn support-btn--primary"
            >
              Call 8080808964
            </Button>
            <LinkButton to="/kyc" variant="outline" className="support-btn support-btn--ghost">
              View KYC Guide
            </LinkButton>
          </div>
        </SpotlightCard>
      </div>
    </section>
  )
}

export default SupportPage
