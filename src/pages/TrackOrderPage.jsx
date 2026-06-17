import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './TrackOrderPage.css'

const SAMPLE_ORDER = {
  orderId: 'NR123456',
  productName: 'Sony Alpha Camera',
  rentalStatus: 'In Transit',
  orderDate: '16 June 2026',
  rentalPeriod: '20 June 2026 – 25 June 2026',
  expectedDelivery: '18 June 2026',
  address: 'Flat 402, Skyline Apartments, Baner, Pune – 411045',
  securityDeposit: 5000,
  rentalCost: 1500,
  paymentStatus: 'Paid',
  customer: {
    name: 'Rahul Sharma',
    phone: '8080808964',
    email: 'rahul.sharma@email.com',
  },
  delivery: {
    courier: 'BlueDart Express',
    trackingNumber: 'BD784512369IN',
    trackingUrl: 'https://www.bluedart.com/track',
  },
}

const TIMELINE = [
  { id: 'placed', label: 'Order Placed', icon: '✅', done: true },
  { id: 'payment', label: 'Payment Confirmed', icon: '✅', done: true },
  { id: 'approved', label: 'Order Approved', icon: '✅', done: true },
  { id: 'shipped', label: 'Item Shipped', icon: '🚚', done: true, active: true },
  { id: 'delivered', label: 'Delivered', icon: '📦', done: false },
  { id: 'return-scheduled', label: 'Return Scheduled', icon: '🔄', done: false },
  { id: 'return-completed', label: 'Return Completed', icon: '✔️', done: false },
  { id: 'deposit-refunded', label: 'Deposit Refunded', icon: '💰', done: false, optional: true },
]

const SUPPORT_LINKS = [
  { label: 'Contact Customer Support', to: '/contact' },
  { label: 'Report an Issue', to: '/support' },
  { label: 'Extend Rental Duration', to: '/dashboard' },
  { label: 'Cancel Order (if eligible)', to: '/support' },
]

function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState('NR123456')
  const [order, setOrder] = useState(SAMPLE_ORDER)
  const [notFound, setNotFound] = useState(false)

  const handleTrack = (event) => {
    event.preventDefault()
    const query = orderIdInput.trim().toUpperCase()

    if (query === 'NR123456' || query === '#NR123456') {
      setOrder(SAMPLE_ORDER)
      setNotFound(false)
      return
    }

    setNotFound(true)
    setOrder(null)
  }

  return (
    <section className="page-section track-order-page" aria-labelledby="track-order-heading">
      <div className="page-section-inner">
        <header className="track-order-header">
          <span className="page-eyebrow">Order Tracking</span>
          <h1 id="track-order-heading" className="page-title">Track Order</h1>
          <p className="page-lead">
            View your rental status, delivery updates, and next steps in one place.
          </p>
        </header>

        <form className="track-order-search page-animate-item" onSubmit={handleTrack}>
          <input
            type="text"
            value={orderIdInput}
            onChange={(event) => setOrderIdInput(event.target.value)}
            placeholder="Enter Order ID (e.g. NR123456)"
            className="track-order-search-input"
            aria-label="Order ID"
          />
          <button type="submit" className="track-order-search-btn">Track</button>
        </form>

        {notFound && (
          <p className="track-order-not-found page-animate-item" role="alert">
            Order not found. Please check your Order ID or contact support.
          </p>
        )}

        {order && (
          <div className="track-order-content">
            <div className="track-order-grid">
              <article className="track-order-card track-order-card--main page-animate-item">
                <div className="track-order-card-head">
                  <h2>Order Details</h2>
                  <span className={`track-status track-status--transit`}>{order.rentalStatus}</span>
                </div>

                <dl className="track-order-details">
                  <div><dt>Order ID</dt><dd>#{order.orderId}</dd></div>
                  <div><dt>Product Name</dt><dd>{order.productName}</dd></div>
                  <div><dt>Rental Status</dt><dd>{order.rentalStatus}</dd></div>
                  <div><dt>Order Date</dt><dd>{order.orderDate}</dd></div>
                  <div><dt>Rental Period</dt><dd>{order.rentalPeriod}</dd></div>
                  <div><dt>Expected Delivery</dt><dd>{order.expectedDelivery}</dd></div>
                  <div className="track-order-details--full">
                    <dt>Pickup / Delivery Address</dt>
                    <dd>{order.address}</dd>
                  </div>
                  <div><dt>Security Deposit</dt><dd>₹{order.securityDeposit.toLocaleString('en-IN')}</dd></div>
                  <div><dt>Rental Cost</dt><dd>₹{order.rentalCost.toLocaleString('en-IN')}</dd></div>
                  <div><dt>Payment Status</dt><dd className="track-payment-paid">{order.paymentStatus}</dd></div>
                </dl>
              </article>

              <article className="track-order-card page-animate-item">
                <h2>Customer Details</h2>
                <dl className="track-order-details track-order-details--compact">
                  <div><dt>Name</dt><dd>{order.customer.name}</dd></div>
                  <div><dt>Contact</dt><dd>{order.customer.phone}</dd></div>
                  <div><dt>Email</dt><dd>{order.customer.email}</dd></div>
                </dl>
              </article>

              <article className="track-order-card page-animate-item">
                <h2>Delivery Partner</h2>
                <dl className="track-order-details track-order-details--compact">
                  <div><dt>Courier</dt><dd>{order.delivery.courier}</dd></div>
                  <div><dt>Tracking Number</dt><dd>{order.delivery.trackingNumber}</dd></div>
                  <div className="track-order-details--full">
                    <dt>Live Tracking</dt>
                    <dd>
                      <a
                        href={order.delivery.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="track-live-link"
                      >
                        Open live tracking
                      </a>
                    </dd>
                  </div>
                </dl>
              </article>
            </div>

            <article className="track-order-card track-order-timeline-card page-animate-item">
              <h2>Order Timeline</h2>
              <ol className="track-timeline">
                {TIMELINE.map((step) => (
                  <li
                    key={step.id}
                    className={`track-timeline-step${step.done ? ' track-timeline-step--done' : ''}${step.active ? ' track-timeline-step--active' : ''}${step.optional ? ' track-timeline-step--optional' : ''}`}
                  >
                    <span className="track-timeline-icon" aria-hidden="true">{step.icon}</span>
                    <span className="track-timeline-label">{step.label}</span>
                  </li>
                ))}
              </ol>
            </article>

            <div className="track-order-support page-animate-item">
              <h2>Support</h2>
              <ul className="track-support-list">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="track-order-actions page-animate-item">
              <a
                href={order.delivery.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="track-action-btn track-action-btn--primary"
              >
                Track Live
              </a>
              <button type="button" className="track-action-btn track-action-btn--ghost">
                Download Invoice
              </button>
              <Link to="/dashboard" className="track-action-btn track-action-btn--ghost">
                Extend Rental
              </Link>
              <Link to="/support" className="track-action-btn track-action-btn--ghost">
                Request Return
              </Link>
              <Link to="/contact" className="track-action-btn track-action-btn--ghost">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default TrackOrderPage
