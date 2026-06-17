import './TopBar.css'

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 12.5C2 10.0147 4.23858 8 7 8C9.76142 8 12 10.0147 12 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
      <path
        d="M8 13.5L1.5 7.5C0.5 6.5 0 5.2 0 3.8C0 1.7 1.6 0 3.6 0C5 0 6.3 0.7 7 1.8C7.7 0.7 9 0 10.4 0C12.4 0 14 1.7 14 3.8C14 5.2 13.5 6.5 12.5 7.5L8 13.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" aria-hidden="true">
      <path d="M0 0.5H2.5L4.5 9H13L15 3H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  )
}

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-left">
          <span>CONTACT US : 123 456 7890</span>
          <span className="top-bar-divider" />
          <span>EMAIL : info@nuevorental.com</span>
        </div>
        <div className="top-bar-right">
          <a href="#login" className="top-bar-link">
            <UserIcon />
            Login / Register
          </a>
          <span className="top-bar-divider" />
          <button type="button" className="top-bar-select">
            EN <ChevronDown />
          </button>
          <span className="top-bar-divider" />
          <button type="button" className="top-bar-select">
            IND <ChevronDown />
          </button>
          <span className="top-bar-divider" />
          <a href="#wishlist" className="top-bar-icon-link" aria-label="Wishlist">
            <HeartIcon />
          </a>
          <span className="top-bar-divider" />
          <a href="#cart" className="top-bar-cart">
            <CartIcon />
            Cart <span className="cart-amount">₹0.00</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default TopBar
