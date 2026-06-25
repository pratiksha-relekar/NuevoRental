import { Link } from 'react-router-dom'
import { NUEVO_RENTAL_LOGO_ALT, NUEVO_RENTAL_LOGO_SRC } from '../constants/brand'
import './BrandLogo.css'

const VARIANTS = {
  header: 'brand-logo--header',
  footer: 'brand-logo--footer',
  sidebar: 'brand-logo--sidebar',
  invoice: 'brand-logo--invoice',
  'admin-auth': 'brand-logo--admin-auth',
  settings: 'brand-logo--settings',
}

export function BrandLogo({
  variant = 'header',
  className = '',
  to = '/',
  asLink = true,
  ...imgProps
}) {
  const image = (
    <img
      src={NUEVO_RENTAL_LOGO_SRC}
      alt={NUEVO_RENTAL_LOGO_ALT}
      className={`brand-logo ${VARIANTS[variant] ?? ''} ${className}`.trim()}
      {...imgProps}
    />
  )

  if (!asLink) return image

  return (
    <Link to={to} className="brand-logo-link" aria-label="Nuevo Rental home">
      {image}
    </Link>
  )
}

export default BrandLogo
