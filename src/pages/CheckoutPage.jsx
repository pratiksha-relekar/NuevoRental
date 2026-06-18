import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  LocateFixed,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCartWishlist } from '../context/CartWishlistContext'
import { useOrders } from '../context/OrdersContext'
import { computeCartSummary, formatINR } from '../utils/cartSummary'
import '../styles/pageAnimations.css'
import './CheckoutPage.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
]

const DELIVERY_SLOTS = [
  '10:00 AM – 1:00 PM',
  '1:00 PM – 4:00 PM',
  '4:00 PM – 7:00 PM',
]

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', description: 'Pay via GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'cod', label: 'Pay on Delivery', description: 'Pay when device is delivered', icon: Wallet },
]

const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'Maharashtra',
  pincode: '',
  landmark: '',
  addressType: 'home',
  instructions: '',
  deliveryDate: '',
  deliverySlot: DELIVERY_SLOTS[0],
  coordinates: null,
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, cartCount, cartTotal, clearCart } = useCartWishlist()
  const { placeOrder } = useOrders()

  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [error, setError] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(null)

  const summary = useMemo(
    () => computeCartSummary(cartItems, cartTotal),
    [cartItems, cartTotal],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/checkout' } })
      return
    }
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart', { replace: true })
    }
  }, [isAuthenticated, cartItems.length, navigate, orderPlaced])

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        city: prev.city || user.location?.split(',')[0]?.trim() || prev.city,
      }))
    }
  }, [user])

  const updateField = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported on this device.')
      return
    }

    setLocationLoading(true)
    setLocationMessage('Detecting your current location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          )
          const data = await response.json()
          const addr = data.address ?? {}

          setAddress((prev) => ({
            ...prev,
            addressLine1:
              [addr.house_number, addr.road, addr.neighbourhood, addr.suburb]
                .filter(Boolean)
                .join(', ') || prev.addressLine1,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            pincode: addr.postcode || prev.pincode,
            landmark: addr.amenity || prev.landmark,
            coordinates: { lat: latitude, lng: longitude },
          }))

          setLocationMessage('Current location added. Please review and complete your address.')
        } catch {
          setAddress((prev) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
          }))
          setLocationMessage('Location detected. Please enter your full delivery address.')
        } finally {
          setLocationLoading(false)
        }
      },
      () => {
        setLocationLoading(false)
        setLocationMessage('Unable to access location. Please enter your address manually.')
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  const validateForm = () => {
    if (!address.fullName.trim()) return 'Please enter your full name.'
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, '').slice(-10))) {
      return 'Please enter a valid 10-digit mobile number.'
    }
    if (!address.addressLine1.trim()) return 'Please enter your street address.'
    if (!address.city.trim()) return 'Please enter your city.'
    if (!address.state.trim()) return 'Please select your state.'
    if (!/^\d{6}$/.test(address.pincode.trim())) return 'Please enter a valid 6-digit PIN code.'
    if (!address.deliveryDate) return 'Please select a preferred delivery date.'
    return ''
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsPlacing(true)

    await new Promise((resolve) => window.setTimeout(resolve, 1200))

    const order = placeOrder({
      items: cartItems,
      delivery: {
        ...address,
        phone: address.phone.replace(/\D/g, '').slice(-10),
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pay_on_delivery' : 'paid',
      },
      summary,
    })

    if (order) {
      clearCart()
      setOrderPlaced(order)
    } else {
      setError('Unable to place order. Please sign in and try again.')
    }

    setIsPlacing(false)
  }

  if (!user) return null

  if (orderPlaced) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-success-heading">
        <div className="checkout-page-inner checkout-page-inner--narrow">
          <div className="checkout-success-card page-animate-item">
            <div className="checkout-success-icon" aria-hidden="true">
              <Package size={40} />
            </div>
            <h1 id="checkout-success-heading">Order Placed Successfully!</h1>
            <p>
              Thank you, {user.displayName}. Your rental order <strong>{orderPlaced.id}</strong> has been confirmed.
            </p>
            <dl className="checkout-success-details">
              <div>
                <dt>Delivery to</dt>
                <dd>
                  {orderPlaced.delivery.fullName}, {orderPlaced.delivery.addressLine1},{' '}
                  {orderPlaced.delivery.city} – {orderPlaced.delivery.pincode}
                </dd>
              </div>
              <div>
                <dt>Estimated delivery</dt>
                <dd>{orderPlaced.estimatedDelivery}</dd>
              </div>
              <div>
                <dt>Amount paid</dt>
                <dd>{formatINR(orderPlaced.summary.payAmount)}</dd>
              </div>
            </dl>
            <div className="checkout-success-actions">
              <Link
                to="/dashboard"
                state={{ activeView: 'orders' }}
                className="checkout-btn checkout-btn--primary"
              >
                View My Orders
              </Link>
              <Link to="/rent-products" className="checkout-btn checkout-btn--ghost">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page" aria-labelledby="checkout-heading">
      <div className="checkout-page-inner">
        <header className="checkout-header page-animate-item">
          <Link to="/cart" className="checkout-back">← Back to cart</Link>
          <div>
            <span className="checkout-eyebrow">Secure Checkout</span>
            <h1 id="checkout-heading" className="checkout-title">Rental Checkout</h1>
            <p className="checkout-lead">
              Enter delivery details to get your rented devices at your doorstep.
            </p>
          </div>
        </header>

        <div className="checkout-steps page-animate-item" aria-label="Checkout progress">
          <span className="checkout-step is-active">1. Address</span>
          <span className="checkout-step">2. Delivery</span>
          <span className="checkout-step">3. Payment</span>
          <span className="checkout-step">4. Place Order</span>
        </div>

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          <div className="checkout-main">
            <section className="checkout-card" aria-labelledby="delivery-address-heading">
              <div className="checkout-card-header">
                <MapPin size={20} aria-hidden="true" />
                <div>
                  <h2 id="delivery-address-heading">Delivery Address</h2>
                  <p>Where should we deliver your rental devices?</p>
                </div>
              </div>

              <button
                type="button"
                className="checkout-location-btn"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
              >
                <LocateFixed size={18} aria-hidden="true" />
                {locationLoading ? 'Detecting location...' : 'Use my current location'}
              </button>

              {locationMessage && (
                <p className="checkout-location-msg" role="status">{locationMessage}</p>
              )}

              {address.coordinates && (
                <p className="checkout-coords">
                  GPS: {address.coordinates.lat.toFixed(5)}, {address.coordinates.lng.toFixed(5)}
                </p>
              )}

              <div className="checkout-form-grid">
                <label className="checkout-field checkout-field--full">
                  <span>Full name *</span>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Name on delivery"
                    required
                  />
                </label>

                <label className="checkout-field">
                  <span>Mobile number *</span>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </label>

                <label className="checkout-field">
                  <span>Email *</span>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </label>

                <label className="checkout-field checkout-field--full">
                  <span>Flat / House no., Building, Street *</span>
                  <input
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                    placeholder="House number, street, area"
                    required
                  />
                </label>

                <label className="checkout-field checkout-field--full">
                  <span>Area, Colony, Sector (optional)</span>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                    placeholder="Apartment, suite, floor"
                  />
                </label>

                <label className="checkout-field">
                  <span>City *</span>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </label>

                <label className="checkout-field">
                  <span>State *</span>
                  <select
                    value={address.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    required
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>

                <label className="checkout-field">
                  <span>PIN code *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit PIN"
                    required
                  />
                </label>

                <label className="checkout-field">
                  <span>Landmark (optional)</span>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => updateField('landmark', e.target.value)}
                    placeholder="Near metro, mall, etc."
                  />
                </label>

                <div className="checkout-field checkout-field--full">
                  <span>Address type</span>
                  <div className="checkout-address-types">
                    {['home', 'work'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`checkout-type-btn${address.addressType === type ? ' is-active' : ''}`}
                        onClick={() => updateField('addressType', type)}
                      >
                        {type === 'home' ? 'Home' : 'Work'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="delivery-schedule-heading">
              <div className="checkout-card-header">
                <Truck size={20} aria-hidden="true" />
                <div>
                  <h2 id="delivery-schedule-heading">Delivery Schedule</h2>
                  <p>Choose when you want your rental delivered.</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <label className="checkout-field">
                  <span>Preferred delivery date *</span>
                  <input
                    type="date"
                    value={address.deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateField('deliveryDate', e.target.value)}
                    required
                  />
                </label>

                <label className="checkout-field">
                  <span>Delivery time slot *</span>
                  <select
                    value={address.deliverySlot}
                    onChange={(e) => updateField('deliverySlot', e.target.value)}
                    required
                  >
                    {DELIVERY_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>

                <label className="checkout-field checkout-field--full">
                  <span>Delivery instructions (optional)</span>
                  <textarea
                    rows={3}
                    value={address.instructions}
                    onChange={(e) => updateField('instructions', e.target.value)}
                    placeholder="Gate code, call before delivery, office reception, etc."
                  />
                </label>
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="payment-heading">
              <div className="checkout-card-header">
                <CreditCard size={20} aria-hidden="true" />
                <div>
                  <h2 id="payment-heading">Payment Method</h2>
                  <p>Select how you would like to pay for this rental.</p>
                </div>
              </div>

              <div className="checkout-payment-options">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <label
                      key={method.id}
                      className={`checkout-payment-option${paymentMethod === method.id ? ' is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                      <Icon size={22} aria-hidden="true" />
                      <div>
                        <strong>{method.label}</strong>
                        <span>{method.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="order-items-heading">
              <div className="checkout-card-header">
                <Package size={20} aria-hidden="true" />
                <div>
                  <h2 id="order-items-heading">Order Items ({cartCount})</h2>
                  <p>Review devices in your rental order.</p>
                </div>
              </div>

              <ul className="checkout-items">
                {cartItems.map((item) => (
                  <li key={item.key} className="checkout-item">
                    <img src={item.image} alt={item.title} />
                    <div>
                      <p className="checkout-item-title">{item.title}</p>
                      <p className="checkout-item-meta">
                        Qty: {item.quantity} · {item.durationLabel}
                      </p>
                    </div>
                    <strong>{formatINR(item.unitPrice * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </section>

            {error && <p className="checkout-error" role="alert">{error}</p>}
          </div>

          <aside className="checkout-summary" aria-labelledby="checkout-summary-heading">
            <h2 id="checkout-summary-heading">Order Summary</h2>

            <ul className="checkout-summary-perks">
              <li><Truck size={14} /> Free doorstep delivery</li>
              <li><ShieldCheck size={14} /> Zero security deposit</li>
            </ul>

            <dl className="checkout-summary-rows">
              <div>
                <dt>Items ({cartCount})</dt>
                <dd>{formatINR(summary.totalMrp)}</dd>
              </div>
              {summary.rentalDiscount > 0 && (
                <div className="is-discount">
                  <dt>Duration savings</dt>
                  <dd>- {formatINR(summary.rentalDiscount)}</dd>
                </div>
              )}
              <div className="is-discount">
                <dt>Nuevo offer (10%)</dt>
                <dd>- {formatINR(summary.nuevoOfferDiscount)}</dd>
              </div>
              {summary.bulkBonusDiscount > 0 && (
                <div className="is-discount">
                  <dt>Bulk bonus (5%)</dt>
                  <dd>- {formatINR(summary.bulkBonusDiscount)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery</dt>
                <dd className="is-free">FREE</dd>
              </div>
              <div>
                <dt>GST</dt>
                <dd className="is-free">Included</dd>
              </div>
            </dl>

            <div className="checkout-summary-total">
              <span>Total amount</span>
              <strong>{formatINR(summary.payAmount)}</strong>
            </div>

            <p className="checkout-summary-note">
              By placing your order, you agree to Nuevo Rental terms and doorstep delivery policy.
            </p>

            <button
              type="submit"
              className="checkout-btn checkout-btn--primary checkout-btn--block"
              disabled={isPlacing}
            >
              {isPlacing ? 'Placing order...' : 'Place your rental order'}
            </button>

            <Link to="/cart" className="checkout-btn checkout-btn--ghost checkout-btn--block">
              Back to cart
            </Link>
          </aside>
        </form>
      </div>
    </section>
  )
}

export default CheckoutPage
