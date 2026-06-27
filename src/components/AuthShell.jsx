import { NUEVO_RENTAL_LOGO_ALT, NUEVO_RENTAL_LOGO_SRC } from '../constants/brand'
import laptopImg from '../assets/laptop.png'

const DEFAULT_FEATURES = [
  'Flexible daily, monthly & long-term plans',
  'Doorstep delivery across major cities',
  'Track rentals, orders & KYC in one place',
]

function AuthShell({
  ariaLabelledBy,
  brandEyebrow,
  brandTitle,
  brandLead,
  features = DEFAULT_FEATURES,
  mobileTagline = 'IT Equipment Rental',
  children,
}) {
  return (
    <section className="page-section auth-page" aria-labelledby={ariaLabelledBy}>
      <div className="auth-shell">
        <aside className="auth-brand-panel" aria-label="Nuevo Rental">
          <div className="auth-brand-panel-inner">
            <img
              src={NUEVO_RENTAL_LOGO_SRC}
              alt={NUEVO_RENTAL_LOGO_ALT}
              className="auth-brand-logo"
            />
            <span className="auth-brand-eyebrow">{brandEyebrow}</span>
            <h2 className="auth-brand-title">{brandTitle}</h2>
            <p className="auth-brand-lead">{brandLead}</p>
            <ul className="auth-brand-features">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <img
              src={laptopImg}
              alt=""
              className="auth-brand-visual"
              aria-hidden="true"
            />
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-mobile-bar" aria-hidden="true">
            <img
              src={NUEVO_RENTAL_LOGO_SRC}
              alt=""
              className="auth-mobile-logo"
            />
            <span className="auth-mobile-tagline">{mobileTagline}</span>
          </div>

          <div className="auth-card page-animate-item">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default AuthShell
