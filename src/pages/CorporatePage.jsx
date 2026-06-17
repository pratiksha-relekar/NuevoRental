import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './CorporatePage.css'

const CORPORATE_INTRO = [
  'Equip your team without heavy investments.',
  'Rent laptops, desktops, printers, and IT equipment for offices, projects or events.',
]

const BENEFITS = [
  'Bulk pricing discounts',
  'Dedicated account manager',
  'GST billing',
  'Flexible tenure',
  'Quick deployment',
  'Pan-India support',
]

function CorporatePage() {
  return (
    <section className="page-section corporate-page" aria-labelledby="corporate-heading">
      <div className="page-section-inner">
        <header className="corporate-header">
          <span className="page-eyebrow">Corporate Rentals</span>
          <h1 id="corporate-heading" className="page-title">
            Smart Rental Solutions for Businesses
          </h1>
        </header>

        <div className="corporate-layout">
          <div className="corporate-intro">
            {CORPORATE_INTRO.map((line) => (
              <p key={line} className="corporate-intro-text page-animate-item">{line}</p>
            ))}
          </div>

          <div className="corporate-benefits page-animate-item">
            <h2 className="corporate-benefits-title">Benefits</h2>
            <ul className="corporate-benefits-list">
              {BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <span className="corporate-check" aria-hidden="true">✔</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="corporate-cta page-animate-item">
          <Link to="/contact" className="corporate-btn corporate-btn--primary">
            Request Quote
          </Link>
          <a href="tel:8080808964" className="corporate-btn corporate-btn--ghost">
            Talk to Expert
          </a>
        </div>
      </div>
    </section>
  )
}

export default CorporatePage
