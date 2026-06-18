import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useCartWishlist } from '../context/CartWishlistContext'
import Logo from './Logo'
import HeaderSearch from './HeaderSearch'
import './Header.css'

const LOCATIONS = [
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

const SHOP_LINKS = [
  { label: 'All Rentals', to: '/rent-products' },
  { label: 'Laptops', to: '/rent-products?category=laptops' },
  { label: 'Desktops', to: '/rent-products?category=desktops' },
  { label: 'Mobile Phones', to: '/rent-products?category=mobiles' },
  { label: 'Printers', to: '/rent-products?category=printers' },
  { label: 'Projectors', to: '/rent-products?category=projectors' },
]

const SUPER_DEALS_LINKS = [
  { label: 'Weekly Deal', to: '/rent-products' },
  { label: 'Pricing Plans', to: '/pricing' },
  { label: 'Corporate Rentals', to: '/corporate' },
  { label: 'Bulk Discounts', to: '/corporate' },
]

const WHATS_NEW_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Support', to: '/support' },
  { label: 'Contact Us', to: '/contact' },
]

const NAV_ITEMS = [
  { type: 'link', label: 'Home', to: '/', end: true },
  { type: 'dropdown', id: 'shop', label: 'Shop', links: SHOP_LINKS },
  { type: 'dropdown', id: 'super-deals', label: 'Super Deals', links: SUPER_DEALS_LINKS },
  { type: 'link', label: 'Find Store', to: '/locations' },
  { type: 'dropdown', id: 'whats-new', label: "What's New", links: WHATS_NEW_LINKS },
  { type: 'link', label: 'Special Offer', to: '/pricing', icon: 'bolt' },
  { type: 'link', label: 'All Products', to: '/rent-products' },
  { type: 'link', label: 'Imported', to: '/corporate' },
]

const NAV_DROPDOWN_IDS = new Set(['shop', 'super-deals', 'whats-new'])

function getMenuLinks(menuId) {
  if (menuId === 'categories') {
    return [
      { label: 'All Products', to: '/rent-products' },
      ...CATEGORIES.map((c) => ({ label: c.label, to: `/rent-products?category=${c.id}` })),
    ]
  }
  const navItem = NAV_ITEMS.find((item) => item.id === menuId)
  return navItem?.links ?? []
}

function getMenuTitle(menuId) {
  if (menuId === 'categories') return 'Browse Categories'
  if (menuId === 'location') return 'Select Location'
  const navItem = NAV_ITEMS.find((item) => item.id === menuId)
  return navItem?.label ?? ''
}

function ChevronDown({ className }) {
  return (
    <svg
      className={className}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M0 1H16M0 6H16M0 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
      <path
        d="M7 15C7 15 13 10 13 6.5C13 3.46 10.31 1 7 1C3.69 1 1 3.46 1 6.5C1 10 7 15 7 15Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="7" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.25s-7-4.35-7-10.1C5 6.55 7.13 4.5 9.75 4.5c1.48 0 2.86.74 3.75 1.92.89-1.18 2.27-1.92 3.75-1.92 2.62 0 4.75 2.05 4.75 5.65 0 5.75-7 10.1-7 10.1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 3h2l2.2 11.3a1 1 0 001 .8h9.6a1 1 0 00.98-.8L20 7H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.5" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Header() {
  const { cartCount, wishlistCount } = useCartWishlist()
  const [location, setLocation] = useState('Pune')
  const [openMenu, setOpenMenu] = useState(null)
  const [badgePulse, setBadgePulse] = useState({ cart: false, wishlist: false })
  const prevCounts = useRef({ cart: cartCount, wishlist: wishlistCount })
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches,
  )
  const headerRef = useRef(null)

  const closeMenus = () => setOpenMenu(null)

  const openOnly = (menu, event) => {
    event.preventDefault()
    event.stopPropagation()
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }

  const showMobilePanel =
    isMobile &&
    openMenu &&
    (openMenu === 'categories' || openMenu === 'location' || NAV_DROPDOWN_IDS.has(openMenu))

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMenus()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeMenus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('header-menu-open', Boolean(openMenu))
    return () => document.body.classList.remove('header-menu-open')
  }, [openMenu])

  useEffect(() => {
    const prev = prevCounts.current
    const nextPulse = { cart: false, wishlist: false }

    if (cartCount > prev.cart) nextPulse.cart = true
    if (wishlistCount !== prev.wishlist) nextPulse.wishlist = true

    prevCounts.current = { cart: cartCount, wishlist: wishlistCount }

    if (nextPulse.cart || nextPulse.wishlist) {
      setBadgePulse(nextPulse)
      const timer = window.setTimeout(() => {
        setBadgePulse({ cart: false, wishlist: false })
      }, 450)
      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [cartCount, wishlistCount])

  const mobilePanelLinks = openMenu ? getMenuLinks(openMenu) : []

  return (
    <header
      className={`main-header${openMenu ? ' main-header--menu-open' : ''}`}
      ref={headerRef}
    >
      <div className="main-header-inner">
        <div className="header-top">
          <Logo />

          <div className="header-search-area">
            <div className={`header-dropdown header-location${openMenu === 'location' ? ' is-open' : ''}`}>
              <button
                type="button"
                className="header-location-btn"
                onClick={(e) => openOnly('location', e)}
                aria-expanded={openMenu === 'location'}
                aria-haspopup="listbox"
              >
                <PinIcon />
                <span className="header-location-text">
                  <span className="header-location-label">Location</span>
                  <span className="header-location-value">{location}</span>
                </span>
                <ChevronDown className="header-chevron" />
              </button>
              {!isMobile && openMenu === 'location' && (
                <ul className="header-dropdown-menu header-dropdown-menu--desktop" role="listbox" aria-label="Select location">
                  {LOCATIONS.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={location === city}
                        className={location === city ? 'is-selected' : undefined}
                        onClick={() => {
                          setLocation(city)
                          closeMenus()
                        }}
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <HeaderSearch />
          </div>

          <div className="header-actions">
            <Link
              to="/wishlist"
              className="header-action-btn header-action-btn--wishlist"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span
                  className={`header-action-badge header-action-badge--wishlist${badgePulse.wishlist ? ' header-action-badge--pulse' : ''}`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="header-action-btn header-action-btn--cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  className={`header-action-badge${badgePulse.cart ? ' header-action-badge--pulse' : ''}`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard" className="header-account">
              <UserIcon />
              <span className="header-account-text">
                <span className="header-account-greet">Hello,</span>
                <span className="header-account-label">Login / Sign Up</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="header-bottom-scroll">
          <div className="header-bottom">
            <div className={`header-dropdown header-categories${openMenu === 'categories' ? ' is-open' : ''}`}>
              <button
                type="button"
                className="header-categories-btn"
                onClick={(e) => openOnly('categories', e)}
                aria-expanded={openMenu === 'categories'}
                aria-haspopup="true"
              >
                <MenuIcon />
                Browse Categories
                <ChevronDown className="header-chevron" />
              </button>
              {!isMobile && openMenu === 'categories' && (
                <ul className="header-dropdown-menu header-dropdown-menu--desktop header-categories-menu">
                  <li>
                    <Link to="/rent-products" onClick={closeMenus}>All Products</Link>
                  </li>
                  {CATEGORIES.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/rent-products?category=${category.id}`}
                        onClick={closeMenus}
                      >
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <nav className="header-nav" aria-label="Main navigation">
              <ul className="header-nav-list">
                {NAV_ITEMS.map((item) => {
                  if (item.type === 'link') {
                    return (
                      <li key={item.label} className="header-nav-item">
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `header-nav-link${isActive ? ' active' : ''}${item.icon === 'bolt' ? ' header-nav-link--offer' : ''}`
                          }
                          onClick={closeMenus}
                        >
                          {item.icon === 'bolt' && (
                            <span className="header-nav-bolt" aria-hidden="true">⚡</span>
                          )}
                          {item.label}
                        </NavLink>
                      </li>
                    )
                  }

                  return (
                    <li
                      key={item.id}
                      className={`header-nav-item header-dropdown header-nav-dropdown${openMenu === item.id ? ' is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="header-nav-link header-nav-dropdown-btn"
                        onClick={(e) => openOnly(item.id, e)}
                        aria-expanded={openMenu === item.id}
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown className="header-chevron" />
                      </button>
                      {!isMobile && openMenu === item.id && (
                        <ul className="header-dropdown-menu header-dropdown-menu--desktop header-nav-dropdown-menu">
                          {item.links.map((link) => (
                            <li key={link.label}>
                              <Link to={link.to} onClick={closeMenus}>
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        {showMobilePanel && (
          <div className="header-mobile-panel" role="region" aria-label={getMenuTitle(openMenu)}>
            <p className="header-mobile-panel-title">{getMenuTitle(openMenu)}</p>
            {openMenu === 'location' ? (
              <ul className="header-mobile-panel-list">
                {LOCATIONS.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      className={location === city ? 'is-selected' : undefined}
                      onClick={() => {
                        setLocation(city)
                        closeMenus()
                      }}
                    >
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul
                className={`header-mobile-panel-list${openMenu === 'categories' ? ' header-mobile-panel-list--scroll' : ''}`}
              >
                {mobilePanelLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} onClick={closeMenus}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
