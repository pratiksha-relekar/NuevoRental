import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './SupportPage.css'

const SUPPORT_INTRO = [
  'Facing an issue? Need upgrade or relocation?',
  'Raise a ticket from your dashboard or contact support.',
]

const SUPPORT_SERVICES = [
  'Repair Support',
  'Replacement Requests',
  'Upgrade Requests',
  'Relocation Help',
  'Pickup Scheduling',
]

function SupportPage() {
  return (
    <section className="page-section support-page" aria-labelledby="support-heading">
      <div className="page-section-inner">
        <header className="support-header">
          <span className="page-eyebrow">Customer Support</span>
          <h1 id="support-heading" className="page-title">We&apos;re Here to Help</h1>
        </header>

        <div className="support-layout">
          <div className="support-intro">
            <ul className="support-intro-list">
              {SUPPORT_INTRO.map((line) => (
                <li key={line} className="page-animate-item">{line}</li>
              ))}
            </ul>
          </div>

          <div className="support-services page-animate-item">
            <h2 className="support-services-title">Support Services</h2>
            <ul className="support-services-list">
              {SUPPORT_SERVICES.map((service) => (
                <li key={service}>
                  <span className="support-check" aria-hidden="true">✔</span>
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="support-cta page-animate-item">
          <Link to="/dashboard" className="support-btn support-btn--primary">
            Raise Support Ticket
          </Link>
          <Link to="/contact" className="support-btn support-btn--ghost">
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SupportPage
