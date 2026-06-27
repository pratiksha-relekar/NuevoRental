import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Lightfall from '../components/Lightfall'
import { submitSupportRequest } from '../data/supportStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LinkButton } from '@/components/ui/link-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [error, setError] = useState('')
  const topicInputRef = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmittedId(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const topic = String(formData.get('topic') ?? 'other')
    const message = String(formData.get('message') ?? '').trim()

    if (!name || !phone || !email || !message) {
      setError('Please fill in your name, phone, email, and message.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)

    try {
      const request = await submitSupportRequest({
        name,
        phone: phoneDigits.slice(-10),
        email,
        topic,
        message,
        source: 'contact',
      })

      setSubmittedId(request.id)
      form.reset()
    } catch {
      setError('Could not submit your inquiry right now. Please try again or call 8080808964.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <LinkButton to="/rent-products" variant="default" className="contact-btn contact-btn--primary">
              Browse Products
            </LinkButton>
          </div>

          <form className="contact-form contact-reveal contact-reveal--d1" onSubmit={handleSubmit}>
            <h2 className="contact-form-title">Send a Message</h2>
            <p className="contact-form-desc">Fill in your details and we&apos;ll get back to you shortly.</p>

            {submittedId && (
              <Alert className="contact-form-success" role="status">
                <AlertDescription>
                  Thank you! Your inquiry <strong>{submittedId}</strong> was submitted. Our support team
                  will contact you within 24 hours.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="contact-form-error" variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="contact-form-row">
              <Label className="contact-field">
                <span>Full Name</span>
                <Input type="text" name="name" placeholder="Your name" autoComplete="name" />
              </Label>
              <Label className="contact-field">
                <span>Phone</span>
                <Input type="tel" name="phone" placeholder="10-digit mobile" autoComplete="tel" />
              </Label>
            </div>
            <Label className="contact-field">
              <span>Email</span>
              <Input type="email" name="email" placeholder="you@company.com" autoComplete="email" />
            </Label>
            <Label className="contact-field">
              <span>Inquiry Type</span>
              <input type="hidden" name="topic" ref={topicInputRef} defaultValue="rental" />
              <Select
                defaultValue="rental"
                onValueChange={(value) => {
                  if (topicInputRef.current) {
                    topicInputRef.current.value = value
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rental">Product Rental</SelectItem>
                  <SelectItem value="corporate">Corporate / Bulk Order</SelectItem>
                  <SelectItem value="delivery">Delivery &amp; Setup</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing &amp; Invoice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <Label className="contact-field">
              <span>Message</span>
              <Textarea name="message" rows={4} placeholder="Tell us about your rental needs..." />
            </Label>
            <Button
              type="submit"
              variant="default"
              className="contact-btn contact-btn--primary contact-btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : 'Submit Inquiry'}
            </Button>
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
              <LinkButton to="/corporate" variant="default" className="contact-btn contact-btn--primary">
                Corporate Rentals
              </LinkButton>
              <Button
                render={<a href="tel:8080808964" />}
                variant="outline"
                className="contact-btn contact-btn--outline"
              >
                Call Now
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ContactPage
