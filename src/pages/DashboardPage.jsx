import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartWishlist } from '../context/CartWishlistContext'
import { useKyc } from '../context/KycContext'
import { useOrders, getOrderStatusLabel } from '../context/OrdersContext'
import { KYC_STEP_STATUS, KYC_STEPS } from '../data/kycSteps'
import { formatINR } from '../utils/cartSummary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LinkButton } from '@/components/ui/link-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
const NAV_ITEMS = [
  { id: 'profile', label: 'Profile details', icon: 'user' },
  { id: 'settings', label: 'Account settings', icon: 'settings' },
  { id: 'support', label: 'Help & support', icon: 'help' },
  { type: 'divider' },
  { id: 'orders', label: 'My Orders', icon: 'orders', badgeKey: 'orders' },
  { id: 'wishlist', label: 'Wishlist', icon: 'heart', badgeKey: 'wishlist' },
  { id: 'kyc', label: 'KYC Status', icon: 'kyc' },
  { type: 'divider' },
  { id: 'logout', label: 'Logout', icon: 'logout', danger: true },
]

function formatMemberSince(isoDate) {
  if (!isoDate) return 'Recently joined'
  try {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(
      new Date(isoDate),
    )
  } catch {
    return 'Recently joined'
  }
}

function getInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 3)
  return `${visible}***@${domain}`
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9a2.5 2.5 0 014.5 1.5c0 2-2.5 2-2.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function KycIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const ICONS = {
  user: UserIcon,
  settings: SettingsIcon,
  help: HelpIcon,
  orders: OrdersIcon,
  heart: HeartIcon,
  kyc: KycIcon,
  logout: LogoutIcon,
}

function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, updateProfile } = useAuth()
  const { cartCount, wishlistCount } = useCartWishlist()
  const { kycState, progress: kycProgress, isApproved: isKycApproved, verificationNotice, dismissVerificationNotice } = useKyc()
  const { orders, orderCount } = useOrders()
  const [activeView, setActiveView] = useState(() => location.state?.activeView ?? 'profile')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    aboutMe: '',
  })

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        location: user.location ?? '',
        aboutMe: user.aboutMe ?? '',
      })
    }
  }, [user])

  if (!user) return null

  const firstName = user.firstName || user.displayName.split(' ')[0]
  const providerLabel = user.provider === 'google' ? 'via Google' : 'via Email'
  const memberSince = formatMemberSince(user.memberSince)

  const badges = {
    orders: orderCount,
    wishlist: wishlistCount,
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      handleLogout()
      return
    }
    setActiveView(item.id)
    setIsEditing(false)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    const result = await updateProfile(form)
    if (result?.ok === false) {
      return
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      location: user.location ?? '',
      aboutMe: user.aboutMe ?? '',
    })
    setIsEditing(false)
  }

  return (
    <section className="account-page" aria-labelledby="account-heading">
      <div className="account-page-inner">
        <header className="account-top">
          <Link to="/" className="account-back">
            ← Home
          </Link>
          <div className="account-top-main">
            <h1 id="account-heading" className="account-title">
              My Account
            </h1>
            <p className="account-welcome">Welcome back, {firstName}</p>
          </div>
          <Link to="/rent-products" className="account-cta">
            + Rent a Device
          </Link>
        </header>

        {verificationNotice && (
          <Alert className={`account-kyc-notice${kycState.status === 'approved' ? ' account-kyc-notice--approved' : ''}`}>
            <AlertDescription>{verificationNotice.message}</AlertDescription>
            <Button type="button" variant="outline" className="account-edit-btn" onClick={() => void dismissVerificationNotice()}>
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="account-layout">
          <aside className="account-sidebar">
            <div className="account-user-card">
              <div className="account-avatar account-avatar--sm" aria-hidden="true">
                {getInitials(user.displayName)}
              </div>
              <div className="account-user-card-text">
                <p className="account-user-name">{user.displayName}</p>
                <p className="account-user-email">{maskEmail(user.email)}</p>
              </div>
              <Badge className="account-badge">RENTER</Badge>
            </div>

            <nav className="account-nav" aria-label="Account navigation">
              {NAV_ITEMS.map((item, index) => {
                if (item.type === 'divider') {
                  return <hr key={`divider-${index}`} className="account-nav-divider" />
                }

                const Icon = ICONS[item.icon]
                const isActive = activeView === item.id

                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    className={`account-nav-item${isActive ? ' is-active' : ''}${item.danger ? ' is-danger' : ''}`}
                    onClick={() => handleNavClick(item)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {item.badgeKey && badges[item.badgeKey] > 0 && (
                      <Badge className="account-nav-badge">{badges[item.badgeKey]}</Badge>
                    )}
                  </Button>
                )
              })}
            </nav>
          </aside>

          <main className="account-content">
            {activeView === 'profile' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">Profile details</h2>
                    <p className="account-panel-subtitle">
                      Manage your rental profile and contact information.
                    </p>
                  </div>
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="account-edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <EditIcon />
                      Edit profile
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form className="account-edit-form" onSubmit={handleSaveProfile}>
                    <div className="account-edit-grid">
                      <Label className="account-field">
                        <span>First name</span>
                        <Input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First name"
                        />
                      </Label>
                      <Label className="account-field">
                        <span>Last name</span>
                        <Input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last name"
                        />
                      </Label>
                      <Label className="account-field">
                        <span>Phone</span>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </Label>
                      <Label className="account-field">
                        <span>Location</span>
                        <Input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                        />
                      </Label>
                      <Label className="account-field account-field--full">
                        <span>About me</span>
                        <Textarea
                          rows={4}
                          value={form.aboutMe}
                          onChange={(e) => setForm((prev) => ({ ...prev, aboutMe: e.target.value }))}
                          placeholder="Share delivery preferences or rental needs."
                        />
                      </Label>
                    </div>
                    <div className="account-edit-actions">
                      <Button type="button" variant="outline" className="account-btn account-btn--ghost" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="default" className="account-btn account-btn--primary">
                        Save changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="account-profile-hero">
                      <div className="account-avatar account-avatar--lg" aria-hidden="true">
                        {getInitials(user.displayName)}
                      </div>
                      <div className="account-profile-hero-text">
                        <h3>{user.displayName}</h3>
                        <div className="account-profile-badges">
                          <Badge className="account-badge">RENTER</Badge>
                          <Badge className="account-badge account-badge--muted">{providerLabel}</Badge>
                        </div>
                        <p className="account-member-since">
                          <CalendarIcon />
                          Member since {memberSince}
                        </p>
                      </div>
                    </div>

                    <dl className="account-details-grid">
                      <div className="account-detail">
                        <dt>Email</dt>
                        <dd>{user.email}</dd>
                      </div>
                      <div className="account-detail">
                        <dt>Phone</dt>
                        <dd className={!user.phone ? 'is-empty' : undefined}>
                          {user.phone || 'Not added'}
                        </dd>
                      </div>
                      <div className="account-detail">
                        <dt>Location</dt>
                        <dd className={!user.location ? 'is-empty' : undefined}>
                          {user.location || 'Not added'}
                        </dd>
                      </div>
                      <div className="account-detail account-detail--full">
                        <dt>About me</dt>
                        <dd className={!user.aboutMe ? 'is-empty' : undefined}>
                          {user.aboutMe || 'Share a short bio for smoother deliveries and support.'}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            )}

            {activeView === 'settings' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">Account settings</h2>
                    <p className="account-panel-subtitle">
                      Manage login details and rental account preferences.
                    </p>
                  </div>
                </div>
                <dl className="account-details-grid">
                  <div className="account-detail">
                    <dt>Login email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div className="account-detail">
                    <dt>Sign-in method</dt>
                    <dd>{user.provider === 'google' ? 'Google account' : 'Email & password'}</dd>
                  </div>
                  <div className="account-detail">
                    <dt>Rental notifications</dt>
                    <dd>Order updates, pickup reminders, and payment alerts</dd>
                  </div>
                  <div className="account-detail">
                    <dt>Default city</dt>
                    <dd className={!user.location ? 'is-empty' : undefined}>
                      {user.location || 'Set your city in profile details'}
                    </dd>
                  </div>
                </dl>
                <div className="account-quick-links">
                  <Link to="/kyc" className="account-quick-link">Complete KYC verification →</Link>
                  <Link to="/pricing" className="account-quick-link">View rental pricing plans →</Link>
                </div>
              </div>
            )}

            {activeView === 'support' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">Help & support</h2>
                    <p className="account-panel-subtitle">
                      Get help with rentals, payments, pickups, and device issues.
                    </p>
                  </div>
                </div>
                <div className="account-support-grid">
                  <div className="account-support-card">
                    <h3>Contact support</h3>
                    <p>Call 8080808964 or email support@nuevorental.com for rental assistance.</p>
                  </div>
                  <div className="account-support-card">
                    <h3>Support centre</h3>
                    <p>Browse FAQs on orders, KYC, extensions, and doorstep pickup.</p>
                    <LinkButton to="/support" variant="default" className="account-btn account-btn--primary account-btn--inline">
                      Open support page
                    </LinkButton>
                  </div>
                  <div className="account-support-card">
                    <h3>Store locations</h3>
                    <p>Find a Nuevo Rental store near you for in-person help.</p>
                    <LinkButton to="/locations" variant="outline" className="account-btn account-btn--ghost account-btn--inline">
                      Find stores
                    </LinkButton>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'orders' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">My Orders</h2>
                    <p className="account-panel-subtitle">
                      Track placed rental orders, delivery status, and order history.
                    </p>
                  </div>
                  <LinkButton to="/orders" variant="outline" className="account-edit-btn">
                    View all orders
                  </LinkButton>
                </div>

                {orders.length > 0 ? (
                  <ul className="account-orders-list">
                    {orders.map((order) => (
                      <li key={order.id} className="account-order-card">
                        <div className="account-order-card-top">
                          <div>
                            <p className="account-order-id">{order.id}</p>
                            <p className="account-order-date">
                              Placed on{' '}
                              {new Intl.DateTimeFormat('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(new Date(order.placedAt))}
                            </p>
                          </div>
                          <Badge className={`account-order-status account-order-status--${order.status}`}>
                            {getOrderStatusLabel(order)}
                          </Badge>
                        </div>

                        <ul className="account-order-items">
                          {order.items.map((item) => (
                            <li key={item.key}>
                              <img src={item.image} alt={item.title} />
                              <div>
                                <p>{item.title}</p>
                                <span>Qty {item.quantity} · {item.durationLabel}</span>
                              </div>
                              <strong>{formatINR(item.unitPrice * item.quantity)}</strong>
                            </li>
                          ))}
                        </ul>

                        <dl className="account-order-delivery">
                          <div>
                            <dt>Deliver to</dt>
                            <dd>
                              {order.delivery.fullName}, {order.delivery.addressLine1},{' '}
                              {order.delivery.city} – {order.delivery.pincode}
                            </dd>
                          </div>
                          <div>
                            <dt>Delivery slot</dt>
                            <dd>
                              {order.delivery.deliveryDate},{' '}
                              {order.delivery.deliverySlot}
                            </dd>
                          </div>
                          <div>
                            <dt>Payment</dt>
                            <dd>
                              {order.payment.method === 'cod'
                                ? 'Pay on delivery'
                                : order.payment.method.toUpperCase()}
                            </dd>
                          </div>
                          <div>
                            <dt>Total paid</dt>
                            <dd>{formatINR(order.summary.payAmount)}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="account-empty-state">
                    <p>No orders yet. Add devices to your cart and complete checkout to place a rental order.</p>
                    {cartCount > 0 ? (
                      <LinkButton to="/checkout" variant="default" className="account-btn account-btn--primary account-btn--inline">
                        Complete checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})
                      </LinkButton>
                    ) : (
                      <LinkButton to="/rent-products" variant="default" className="account-btn account-btn--primary account-btn--inline">
                        Browse rental products
                      </LinkButton>
                    )}
                  </div>
                )}

                {cartCount > 0 && orders.length > 0 && (
                  <div className="account-quick-links">
                    <Link to="/checkout" className="account-quick-link">
                      Complete checkout for {cartCount} cart item{cartCount !== 1 ? 's' : ''} →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeView === 'wishlist' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">Wishlist</h2>
                    <p className="account-panel-subtitle">
                      Devices you saved for future rentals.
                    </p>
                  </div>
                  <LinkButton to="/wishlist" variant="outline" className="account-edit-btn">
                    Open wishlist
                  </LinkButton>
                </div>
                {wishlistCount > 0 ? (
                  <div className="account-summary-card">
                    <p>
                      You have <strong>{wishlistCount}</strong> saved item{wishlistCount !== 1 ? 's' : ''} in your wishlist.
                    </p>
                    <LinkButton to="/wishlist" variant="default" className="account-btn account-btn--primary account-btn--inline">
                      View saved devices
                    </LinkButton>
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <p>Your wishlist is empty. Save devices to rent them later.</p>
                    <LinkButton to="/rent-products" variant="default" className="account-btn account-btn--primary account-btn--inline">
                      Explore products
                    </LinkButton>
                  </div>
                )}
              </div>
            )}

            {activeView === 'kyc' && (
              <div className="account-panel">
                <div className="account-panel-header">
                  <div>
                    <h2 className="account-panel-title">KYC Status</h2>
                    <p className="account-panel-subtitle">
                      Track each verification step — documents, OCR, and live face check.
                    </p>
                  </div>
                  <LinkButton to="/kyc" variant="outline" className="account-edit-btn">
                    {isKycApproved ? 'View KYC' : 'Continue KYC'}
                  </LinkButton>
                </div>

                <div className={`account-kyc-summary${isKycApproved ? ' account-kyc-summary--approved' : ''}`}>
                  <span className="account-kyc-dot" aria-hidden="true" />
                  <div>
                    <h3>
                      {isKycApproved
                        ? 'KYC Approved'
                        : kycState.status === 'in_review'
                          ? 'Awaiting admin review'
                          : kycState.status === 'in_progress'
                            ? `Verification in progress (${kycProgress}%)`
                            : kycState.status === 'rejected'
                              ? 'KYC rejected — resubmit documents'
                              : 'Verification pending'}
                    </h3>
                    <p>
                      {isKycApproved
                        ? 'Your identity is verified. You can rent high-value devices without delays.'
                        : kycState.status === 'in_review'
                          ? 'Your documents are submitted. Admin will review your KYC and confirm pending rental orders.'
                          : 'Complete Aadhaar/PAN upload, OCR verification, and live face check to get approved.'}
                    </p>
                  </div>
                </div>

                <ul className="account-kyc-steps">
                  {KYC_STEPS.map((step) => {
                    const status = kycState.stepStatuses[step.id] ?? KYC_STEP_STATUS.PENDING
                    const statusLabel =
                      status === KYC_STEP_STATUS.DONE
                        ? 'Done'
                        : status === KYC_STEP_STATUS.PROCESSING
                          ? 'Processing'
                          : status === KYC_STEP_STATUS.FAILED
                            ? 'Failed'
                            : 'Pending'

                    return (
                      <li
                        key={step.id}
                        className={`account-kyc-step account-kyc-step--${status}`}
                      >
                        <span className="account-kyc-step-marker" aria-hidden="true" />
                        <div className="account-kyc-step-body">
                          <span className="account-kyc-step-label">{step.label}</span>
                          <span className="account-kyc-step-desc">{step.description}</span>
                        </div>
                        <Badge className={`account-kyc-step-badge account-kyc-step-badge--${status}`}>
                          {statusLabel}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>

                {!isKycApproved && (
                  <LinkButton to="/kyc" variant="default" className="account-btn account-btn--primary account-btn--inline">
                    {kycState.status === 'in_progress' ? 'Continue KYC verification' : 'Start KYC verification'}
                  </LinkButton>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
