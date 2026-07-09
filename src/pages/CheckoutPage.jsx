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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LinkButton } from '@/components/ui/link-button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '../context/AuthContext'
import { useCartWishlist } from '../context/CartWishlistContext'
import { useOrders } from '../context/OrdersContext'
import { computeCartSummary, formatINR } from '../utils/cartSummary'
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

  const summary = useMemo(
    () => computeCartSummary(cartItems, cartTotal),
    [cartItems, cartTotal],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/checkout' } })
      return
    }
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [isAuthenticated, cartItems.length, navigate])

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

    try {
      const order = await placeOrder({
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
        await clearCart()
        navigate('/orders', { replace: true, state: { orderPlaced: order } })
      } else {
        setError('Unable to place order. Please sign in and try again.')
      }
    } catch {
      setError('Unable to place order. Please try again.')
    } finally {
      setIsPlacing(false)
    }
  }

  if (!user) return null

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

              <Button
                type="button"
                variant="outline"
                className="checkout-location-btn"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
              >
                <LocateFixed size={18} aria-hidden="true" />
                {locationLoading ? 'Detecting location...' : 'Use my current location'}
              </Button>

              {locationMessage && (
                <p className="checkout-location-msg" role="status">{locationMessage}</p>
              )}

              {address.coordinates && (
                <p className="checkout-coords">
                  GPS: {address.coordinates.lat.toFixed(5)}, {address.coordinates.lng.toFixed(5)}
                </p>
              )}

              <div className="checkout-form-grid">
                <div className="checkout-field checkout-field--full">
                  <Label htmlFor="checkout-fullName">
                    <span>Full name *</span>
                  </Label>
                  <Input
                    id="checkout-fullName"
                    type="text"
                    value={address.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Name on delivery"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-phone">
                    <span>Mobile number *</span>
                  </Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={address.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-email">
                    <span>Email *</span>
                  </Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={address.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </div>

                <div className="checkout-field checkout-field--full">
                  <Label htmlFor="checkout-addressLine1">
                    <span>Flat / House no., Building, Street *</span>
                  </Label>
                  <Input
                    id="checkout-addressLine1"
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                    placeholder="House number, street, area"
                    required
                  />
                </div>

                <div className="checkout-field checkout-field--full">
                  <Label htmlFor="checkout-addressLine2">
                    <span>Area, Colony, Sector (optional)</span>
                  </Label>
                  <Input
                    id="checkout-addressLine2"
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                    placeholder="Apartment, suite, floor"
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-city">
                    <span>City *</span>
                  </Label>
                  <Input
                    id="checkout-city"
                    type="text"
                    value={address.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-state">
                    <span>State *</span>
                  </Label>
                  <Select value={address.state} onValueChange={(value) => updateField('state', value)} required>
                    <SelectTrigger id="checkout-state" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-pincode">
                    <span>PIN code *</span>
                  </Label>
                  <Input
                    id="checkout-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit PIN"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-landmark">
                    <span>Landmark (optional)</span>
                  </Label>
                  <Input
                    id="checkout-landmark"
                    type="text"
                    value={address.landmark}
                    onChange={(e) => updateField('landmark', e.target.value)}
                    placeholder="Near metro, mall, etc."
                  />
                </div>

                <div className="checkout-field checkout-field--full">
                  <span>Address type</span>
                  <div className="checkout-address-types">
                    {['home', 'work'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        className={`checkout-type-btn${address.addressType === type ? ' is-active' : ''}`}
                        onClick={() => updateField('addressType', type)}
                      >
                        {type === 'home' ? 'Home' : 'Work'}
                      </Button>
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
                <div className="checkout-field">
                  <Label htmlFor="checkout-deliveryDate">
                    <span>Preferred delivery date *</span>
                  </Label>
                  <Input
                    id="checkout-deliveryDate"
                    type="date"
                    value={address.deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateField('deliveryDate', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <Label htmlFor="checkout-deliverySlot">
                    <span>Delivery time slot *</span>
                  </Label>
                  <Select value={address.deliverySlot} onValueChange={(value) => updateField('deliverySlot', value)} required>
                    <SelectTrigger id="checkout-deliverySlot" className="w-full">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="checkout-field checkout-field--full">
                  <Label htmlFor="checkout-instructions">
                    <span>Delivery instructions (optional)</span>
                  </Label>
                  <Textarea
                    id="checkout-instructions"
                    rows={3}
                    value={address.instructions}
                    onChange={(e) => updateField('instructions', e.target.value)}
                    placeholder="Gate code, call before delivery, office reception, etc."
                  />
                </div>
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
                      <Input
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
              <li>
                <ShieldCheck size={14} />
                {summary.securityDeposit > 0
                  ? `Security deposit ${formatINR(summary.securityDeposit)}`
                  : 'Zero security deposit'}
              </li>
            </ul>

            <dl className="checkout-summary-rows">
              <div>
                <dt>Items ({cartCount})</dt>
                <dd>{formatINR(summary.totalMrp)}</dd>
              </div>
              {summary.securityDeposit > 0 && (
                <div>
                  <dt>Security deposit</dt>
                  <dd>{formatINR(summary.securityDeposit)}</dd>
                </div>
              )}
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

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isPlacing}
            >
              {isPlacing ? 'Placing order...' : 'Place your rental order'}
            </Button>

            <LinkButton to="/cart" variant="outline" className="w-full">
              Back to cart
            </LinkButton>
          </aside>
        </form>
      </div>
    </section>
  )
}

export default CheckoutPage
