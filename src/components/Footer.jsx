import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import './Footer.css'

const FOOTER_LINKS = [
  { label: 'About Nuevo Rental', to: '/about' },
  { label: 'Rent Products', to: '/rent-products' },
  { label: 'Corporate Rentals', to: '/corporate' },
  { label: 'Locations', to: '/locations' },
  { label: 'Support', to: '/support' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Pricing', to: '/pricing' },
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <BrandLogo variant="footer" className="site-footer-logo-image" />
          <p className="site-footer-tagline">
            Trusted IT &amp; electronics rental across India&apos;s major metro cities.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          <ul className="site-footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="site-footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <p className="site-footer-copy">
            &copy; {year} Nuevo Rental. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
