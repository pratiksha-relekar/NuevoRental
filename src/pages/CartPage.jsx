import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { useCartWishlist } from '../context/CartWishlistContext'
import { computeCartSummary, formatINR } from '../utils/cartSummary'
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
            <LinkButton to="/rent-products">
              Browse Products
            </LinkButton>
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
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          aria-label="Decrease quantity"
                          onClick={() => updateCartQuantity(item.key, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          aria-label="Increase quantity"
                          onClick={() => updateCartQuantity(item.key, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        className="bag-remove"
                        aria-label={`Remove ${item.title} from cart`}
                        onClick={() => removeFromCart(item.key)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
                <Button
                  type="button"
                  variant="outline"
                  className="bag-btn bag-btn--outline bag-btn--block"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <LinkButton
                  to="/checkout"
                  variant="default"
                  className="bag-btn bag-btn--primary bag-btn--block"
                >
                  Proceed to Checkout
                </LinkButton>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

export default CartPage
