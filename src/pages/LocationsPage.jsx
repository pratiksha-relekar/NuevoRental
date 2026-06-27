import { useState } from 'react'
import { checkPincodeAvailability, SERVICEABLE_CITIES } from '../data/serviceablePincodes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
function LocationsPage() {
  const [pinCode, setPinCode] = useState('')
  const [status, setStatus] = useState(null)

  const handleCheck = (event) => {
    event.preventDefault()
    const result = checkPincodeAvailability(pinCode)

    setStatus({
      type: result.available ? 'success' : 'error',
      message: result.message,
      city: result.city,
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
              {SERVICEABLE_CITIES.map((city) => (
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

            <form className="locations-pincode-form" onSubmit={handleCheck} noValidate>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={(event) => {
                  setPinCode(event.target.value.replace(/\D/g, ''))
                  setStatus(null)
                }}
                placeholder="Enter pin code"
                className={cn('locations-pincode-input', status?.type === 'error' && 'is-error')}
                aria-label="Enter your pin code"
                aria-invalid={status?.type === 'error' ? 'true' : 'false'}
                aria-describedby={status ? 'pincode-status' : undefined}
              />
              <Button type="submit" variant="default" className="locations-pincode-btn">
                Check
              </Button>
            </form>

            {status && (
              <Alert
                id="pincode-status"
                className={`locations-pincode-status locations-pincode-status--${status.type}`}
                variant={status.type === 'error' ? 'destructive' : 'default'}
                role={status.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationsPage
