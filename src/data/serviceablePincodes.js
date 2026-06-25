// Pin prefixes for Nuevo Rental service cities (India Post first 3 digits).
const SERVICEABLE_PIN_PREFIXES = {
  Pune: ['411', '412'],
  Mumbai: ['400', '401'],
  'Delhi NCR': ['110', '121', '122', '201'],
  Bengaluru: ['560'],
  Hyderabad: ['500', '501', '502'],
  Chennai: ['600', '601', '603'],
  Kolkata: ['700', '711', '712'],
  Ahmedabad: ['380'],
  Jaipur: ['302'],
}

export const SERVICEABLE_CITIES = Object.keys(SERVICEABLE_PIN_PREFIXES)

function findServiceCity(pincode) {
  const prefix = pincode.slice(0, 3)
  return (
    SERVICEABLE_CITIES.find((city) =>
      SERVICEABLE_PIN_PREFIXES[city].includes(prefix),
    ) ?? null
  )
}

export function checkPincodeAvailability(pincode) {
  const cleaned = String(pincode ?? '').trim()

  if (!/^\d{6}$/.test(cleaned)) {
    return {
      valid: false,
      available: false,
      city: null,
      message: 'Please enter a valid 6-digit pin code.',
    }
  }

  const city = findServiceCity(cleaned)

  if (!city) {
    return {
      valid: true,
      available: false,
      city: null,
      message: 'Wrong pin code. We do not deliver to this area yet. Please check an active city PIN.',
    }
  }

  return {
    valid: true,
    available: true,
    city,
    message: `Great news! ${city} (${cleaned}) is serviceable. Contact us to confirm device availability.`,
  }
}
