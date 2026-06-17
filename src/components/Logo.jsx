import { Link } from 'react-router-dom'
import './Logo.css'

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Nuevo Rental home">
      <span className="logo-text">
        NUEV
        <span className="logo-hex" aria-hidden="true">
          <svg viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 1L26.5 8.5V23.5L14 31L1.5 23.5V8.5L14 1Z"
              fill="#2B8FE8"
              stroke="#2B8FE8"
              strokeWidth="1"
            />
          </svg>
        </span>
        {' '}RENTAL
      </span>
    </Link>
  )
}

export default Logo
