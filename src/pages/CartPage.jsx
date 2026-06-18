import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react'
import { useCartWishlist } from '../context/CartWishlistContext'
import '../styles/pageAnimations.css'
import './CartWishlistPages.css'

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function computeCartSummary(cartItems, cartTotal) {
  const totalMrp = cartItems.reduce((sum, item) => {
    const listPrice = item.originalPrice ?? item.rentalPrice ?? item.unitPrice
    return sum + listPrice * item.quantity
  }, 0)

  const rentalDiscount = Math.max(0, totalMrp - cartTotal)
  const nuevoOfferDiscount = Math.round(cartTotal * 0.1)
  const bulkBonusDiscount = cartTotal >= 2500 ? Math.round(cartTotal * 0.05) : 0
  const payAmount = Math.max(0, cartTotal - nuevoOfferDiscount - bulkBonusDiscount)

  const waivedDelivery = 199
  const waivedSetup = 149
  const waivedPlatform = 99
  const totalSavings =
    rentalDiscount +
    nuevoOfferDiscount +
    bulkBonusDiscount +
    waivedDelivery +
    waivedSetup +
    waivedPlatform

  const savingsPercent = totalMrp > 0
    ? Math.round((totalSavings / totalMrp) * 100)
    : 0

  return {
    totalMrp,
    rentalDiscount,
    nuevoOfferDiscount,
    bulkBonusDiscount,
    payAmount,
    securityDeposit: 0,
    totalSavings,
    savingsPercent,
    waivedDelivery,
    waivedSetup,
    waivedPlatform,
  }
}

function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useCartWishlist()

  const summary = useMemo(
    () => computeCartSummary(cartItems, cartTotal),
    [cartItems, cartTotal],
  )

  return (
    <section className="bag-page" aria-labelledby="cart-heading">
      <div className="bag-page-inner bag-page-inner--cart">
        <header className="bag-page-header page-animate-item">
          <span className="page-eyebrow">Your Cart</span>
          <h1 id="cart-heading" className="page-title">Rental Cart</h1>
          <p className="bag-page-lead">
            {cartCount > 0
              ? `${cartCount} item${cartCount === 1 ? '' : 's'} ready for checkout`
              : 'Your cart is empty. Browse products and add rentals to get started.'}
          </p>
        </header>

        {cartItems.length === 0 ? (
          <div className="bag-empty page-animate-item">
            <ShoppingBag size={48} strokeWidth={1.5} aria-hidden="true" />
            <p>No items in your cart yet.</p>
            <Link to="/rent-products" className="bag-btn bag-btn--primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-main">
              {summary.totalSavings > 0 && (
                <div className="cart-savings-banner page-animate-item">
                  <Tag size={18} aria-hidden="true" />
                  <span>
                    Great choice! You save <strong>{formatINR(summary.totalSavings)}</strong>
                    {summary.savingsPercent > 0 && (
                      <> ({summary.savingsPercent}% off market price)</>
                    )}
                  </span>
                </div>
              )}

              <ul className="bag-list">
                {cartItems.map((item) => (
                  <li key={item.key} className="bag-item page-animate-item">
                    <Link to={`/product/${item.productId}`} className="bag-item-image">
                      <img src={item.image} alt={item.title} />
                    </Link>

                    <div className="bag-item-info">
                      <Link to={`/product/${item.productId}`} className="bag-item-title">
                        {item.title}
                      </Link>
                      <p className="bag-item-meta">Duration: {item.durationLabel}</p>
                      <div className="bag-item-pricing">
                        <p className="bag-item-price">
                          {formatINR(item.unitPrice * item.quantity)}
                        </p>
                        {(item.originalPrice ?? item.rentalPrice) > item.unitPrice && (
                          <p className="bag-item-mrp">
                            MRP: {formatINR((item.originalPrice ?? item.rentalPrice) * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bag-item-actions">
                      <div className="bag-qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateCartQuantity(item.key, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateCartQuantity(item.key, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="bag-remove"
                        aria-label={`Remove ${item.title} from cart`}
                        onClick={() => removeFromCart(item.key)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="bag-summary page-animate-item" aria-labelledby="cart-price-details">
              <h2 id="cart-price-details" className="bag-summary-title">Price Details</h2>

              <ul className="bag-perks" aria-label="Included benefits">
                <li>Free doorstep delivery</li>
                <li>Free setup &amp; pickup</li>
                <li>Zero security deposit</li>
              </ul>

              <dl className="bag-price-breakdown">
                <div className="bag-price-row bag-price-row--mrp">
                  <dt>Total MRP ({cartCount} item{cartCount === 1 ? '' : 's'})</dt>
                  <dd className="bag-price-mrp">{formatINR(summary.totalMrp)}</dd>
                </div>

                {summary.rentalDiscount > 0 && (
                  <div className="bag-price-row bag-price-row--discount">
                    <dt>Duration plan savings</dt>
                    <dd>- {formatINR(summary.rentalDiscount)}</dd>
                  </div>
                )}

                <div className="bag-price-row bag-price-row--discount">
                  <dt>Nuevo special offer (10%)</dt>
                  <dd>- {formatINR(summary.nuevoOfferDiscount)}</dd>
                </div>

                {summary.bulkBonusDiscount > 0 && (
                  <div className="bag-price-row bag-price-row--discount">
                    <dt>Bulk rental bonus (5%)</dt>
                    <dd>- {formatINR(summary.bulkBonusDiscount)}</dd>
                  </div>
                )}

                <div className="bag-price-row">
                  <dt>
                    <Truck size={14} aria-hidden="true" />
                    Delivery charges
                  </dt>
                  <dd className="bag-price-waived">
                    <span className="bag-price-strike">{formatINR(summary.waivedDelivery)}</span>
                    <span className="bag-price-free">FREE</span>
                  </dd>
                </div>

                <div className="bag-price-row">
                  <dt>Doorstep setup</dt>
                  <dd className="bag-price-waived">
                    <span className="bag-price-strike">{formatINR(summary.waivedSetup)}</span>
                    <span className="bag-price-free">FREE</span>
                  </dd>
                </div>

                <div className="bag-price-row">
                  <dt>Platform service fee</dt>
                  <dd className="bag-price-waived">
                    <span className="bag-price-strike">{formatINR(summary.waivedPlatform)}</span>
                    <span className="bag-price-free">WAIVED</span>
                  </dd>
                </div>

                <div className="bag-price-row">
                  <dt>GST</dt>
                  <dd className="bag-price-free">Included</dd>
                </div>

                <div className="bag-price-row">
                  <dt>
                    <ShieldCheck size={14} aria-hidden="true" />
                    Security deposit
                  </dt>
                  <dd className="bag-price-free">{formatINR(summary.securityDeposit)}</dd>
                </div>
              </dl>

              <div className="bag-price-divider" />

              <div className="bag-price-total">
                <span className="bag-price-total-label">You Pay Only</span>
                <strong>{formatINR(summary.payAmount)}</strong>
              </div>

              {summary.totalMrp > summary.payAmount && (
                <p className="bag-summary-savings">
                  Lowest price unlocked — you save {formatINR(summary.totalSavings)} on this order.
                </p>
              )}

              <p className="bag-summary-note">
                All taxes included. No hidden charges at checkout.
              </p>

              <div className="bag-summary-actions">
                <button type="button" className="bag-btn bag-btn--ghost bag-btn--block" onClick={clearCart}>
                  Clear Cart
                </button>
                <Link to="/kyc" className="bag-btn bag-btn--primary bag-btn--block">
                  Proceed to Checkout
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

export default CartPage
