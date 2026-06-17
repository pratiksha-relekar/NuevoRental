import Logo from './Logo'
import './Header.css'

const NAV_LINKS = [
  { label: 'Home', href: '#', active: true },
  { label: 'About Us', href: '#about' },
  { label: 'Shop', href: '#shop' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact Us', href: '#contact' },
]

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function Header() {
  return (
    <header className="main-header">
      <div className="main-header-inner">
        <Logo />

        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={link.active ? 'active' : undefined}
                  aria-current={link.active ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-search">
          <input type="search" placeholder="Search..." aria-label="Search products" />
          <button type="button" className="search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
