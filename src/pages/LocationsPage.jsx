import { useState } from 'react'
import '../styles/pageAnimations.css'
import './LocationsPage.css'

const ACTIVE_CITIES = [
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
]

function LocationsPage() {
  const [pinCode, setPinCode] = useState('')
  const [status, setStatus] = useState(null)

  const handleCheck = (event) => {
    event.preventDefault()
    const cleaned = pinCode.trim()

    if (!/^\d{6}$/.test(cleaned)) {
      setStatus({ type: 'error', message: 'Please enter a valid 6-digit pin code.' })
      return
    }

    setStatus({
      type: 'success',
      message: 'Great news! We deliver to your area. Contact us to confirm availability.',
    })
  }

  return (
    <section className="page-section locations-page" aria-labelledby="locations-heading">
      <div className="page-section-inner">
        <header className="locations-header">
          <span className="page-eyebrow">Service Areas</span>
          <h1 id="locations-heading" className="page-title">
            Available Across Major Indian Cities
          </h1>
          <p className="page-lead">
            We currently serve major metro cities with fast delivery and support.
          </p>
        </header>

        <div className="locations-layout">
          <div className="locations-cities page-animate-item">
            <h2 className="locations-subtitle">Active Cities</h2>
            <ul className="locations-city-list">
              {ACTIVE_CITIES.map((city) => (
                <li key={city}>
                  <span className="locations-city-check" aria-hidden="true">✓</span>
                  {city}
                </li>
              ))}
            </ul>
          </div>

          <div className="locations-pincode page-animate-item">
            <h2 className="locations-subtitle">Check Availability</h2>
            <p className="locations-pincode-text">Enter your pin code to check availability.</p>

            <form className="locations-pincode-form" onSubmit={handleCheck}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={(event) => {
                  setPinCode(event.target.value.replace(/\D/g, ''))
                  setStatus(null)
                }}
                placeholder="Enter pin code"
                className="locations-pincode-input"
                aria-label="Enter your pin code"
              />
              <button type="submit" className="locations-pincode-btn">
                Check
              </button>
            </form>

            {status && (
              <p className={`locations-pincode-status locations-pincode-status--${status.type}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationsPage
