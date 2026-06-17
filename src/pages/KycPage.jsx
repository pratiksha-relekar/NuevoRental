import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './KycPage.css'

const KYC_POINTS = [
  'To ensure safe rentals, basic KYC is required.',
  'Upload valid ID and complete verification in minutes.',
  'All data is encrypted and secure.',
]

function ShieldIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 4L40 12V24C40 33.5 33 41.5 24 44C15 41.5 8 33.5 8 24V12L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 24L22 28L30 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function KycPage() {
  return (
    <section className="page-section kyc-page" aria-labelledby="kyc-heading">
      <div className="page-section-inner kyc-inner">
        <div className="kyc-visual page-animate-item">
          <div className="kyc-shield-wrap">
            <span className="kyc-shield-ring kyc-shield-ring--outer" aria-hidden="true" />
            <span className="kyc-shield-ring kyc-shield-ring--inner" aria-hidden="true" />
            <span className="kyc-shield-icon"><ShieldIcon /></span>
          </div>
        </div>

        <div className="kyc-content">
          <span className="page-eyebrow">Identity Verification</span>
          <h1 id="kyc-heading" className="page-title">Secure &amp; Quick KYC Verification</h1>

          <ul className="kyc-points">
            {KYC_POINTS.map((point) => (
              <li key={point} className="page-animate-item">{point}</li>
            ))}
          </ul>

          <div className="kyc-steps page-animate-item">
            <div className="kyc-step">
              <span className="kyc-step-num">1</span>
              <span>Upload valid government ID</span>
            </div>
            <div className="kyc-step">
              <span className="kyc-step-num">2</span>
              <span>Complete quick verification</span>
            </div>
            <div className="kyc-step">
              <span className="kyc-step-num">3</span>
              <span>Start renting instantly</span>
            </div>
          </div>

          <div className="kyc-actions page-animate-item">
            <button type="button" className="kyc-btn kyc-btn--primary">Start KYC Verification</button>
            <Link to="/dashboard" className="kyc-btn kyc-btn--ghost">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default KycPage
