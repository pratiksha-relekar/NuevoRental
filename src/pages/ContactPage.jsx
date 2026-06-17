import '../styles/pageAnimations.css'
import './ContactPage.css'

const CONTACT_POINTS = [
  'Have questions or need custom rentals?',
  'Our team is ready to assist.',
]

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M5.5 3.5H8L9.5 8L7.25 9.25C8.15 11.55 10.45 13.85 12.75 14.75L14 12.5L18.5 14V16.5C18.5 17.05 18.05 17.5 17.5 17.5C9.85 17.5 3.5 11.15 3.5 3.5C3.5 2.95 3.95 2.5 4.5 2.5H5.5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6.5L11 12L19.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 11H19.5M11 2.5C8.5 5.5 8.5 16.5 11 19.5M11 2.5C13.5 5.5 13.5 16.5 11 19.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function ContactPage() {
  return (
    <section className="page-section contact-page" aria-labelledby="contact-heading">
      <div className="page-section-inner">
        <header className="contact-header">
          <span className="page-eyebrow">Get in Touch</span>
          <h1 id="contact-heading" className="page-title">Contact Us</h1>
        </header>

        <div className="contact-layout">
          <div className="contact-intro">
            <ul className="contact-points">
              {CONTACT_POINTS.map((point) => (
                <li key={point} className="page-animate-item">{point}</li>
              ))}
            </ul>
            <p className="contact-intro-text page-animate-item">
              Reach out for corporate rentals, bulk orders, delivery support, or any rental-related
              questions. We respond quickly during business hours.
            </p>
          </div>

          <div className="contact-cards">
            <a href="tel:8080808964" className="contact-card page-animate-item">
              <span className="contact-card-icon"><PhoneIcon /></span>
              <span className="contact-card-label">Phone</span>
              <span className="contact-card-value">8080808964</span>
            </a>

            <a href="mailto:support@nuevorental.com" className="contact-card page-animate-item">
              <span className="contact-card-icon"><MailIcon /></span>
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">support@nuevorental.com</span>
            </a>

            <a
              href="https://www.nuevorental.com"
              className="contact-card page-animate-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-card-icon"><GlobeIcon /></span>
              <span className="contact-card-label">Website</span>
              <span className="contact-card-value">www.nuevorental.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
