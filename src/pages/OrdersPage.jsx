import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { useAuth } from '../context/AuthContext'
import { getOrderStatusLabel, useOrders } from '../context/OrdersContext'
import { buildInvoiceFromOrder } from '../data/invoiceStorage'
import { InvoiceViewModal } from '../components/invoice/InvoiceViewModal'
import { formatINR } from '../utils/cartSummary'
function formatOrderDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function OrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { orders, ordersReady } = useOrders()
  const [placedOrder, setPlacedOrder] = useState(location.state?.orderPlaced ?? null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/orders' } })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setPlacedOrder(location.state.orderPlaced)
      navigate('/orders', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  if (!isAuthenticated) return null

  return (
    <section className="bag-page orders-page" aria-labelledby="orders-heading">
      <div className="bag-page-inner">
        <header className="bag-page-header page-animate-item">
          <span className="page-eyebrow">Your Orders</span>
          <h1 id="orders-heading" className="page-title">Rental Orders</h1>
          <p className="bag-page-lead">
            {orders.length > 0
              ? `You have ${orders.length} rental order${orders.length === 1 ? '' : 's'}. Track delivery and payment details below.`
              : 'No orders yet. Complete checkout to see your rental orders here.'}
          </p>
        </header>

        {placedOrder && (
          <div className="orders-success-banner page-animate-item" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <strong>Order placed successfully!</strong>
              <p>
                Thank you. Your order <span>{placedOrder.id}</span>{' '}
                {placedOrder.awaitingKyc
                  ? 'is saved and will be confirmed once KYC is approved.'
                  : 'has been confirmed.'}
              </p>
            </div>
          </div>
        )}

        {!ordersReady ? (
          <div className="orders-loading page-animate-item">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="bag-empty page-animate-item">
            <ShoppingBag size={48} strokeWidth={1.5} aria-hidden="true" />
            <p>No rental orders yet.</p>
            <LinkButton to="/rent-products">
              Browse Products
            </LinkButton>
          </div>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order.id} className="orders-card page-animate-item">
                <div className="orders-card-top">
                  <div>
                    <p className="orders-card-id">{order.id}</p>
                    <p className="orders-card-date">Placed on {formatOrderDate(order.placedAt)}</p>
                  </div>
                  <span className={`orders-status orders-status--${order.status}`}>
                    {getOrderStatusLabel(order)}
                  </span>
                </div>

                <ul className="orders-items">
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

                <dl className="orders-meta">
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
                      {order.delivery.deliveryDate}, {order.delivery.deliverySlot}
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

                <div className="orders-card-actions">
                  <Button
                    type="button"
                    variant="outline"
                    className="orders-invoice-btn"
                    onClick={() => setSelectedInvoice(buildInvoiceFromOrder(order))}
                  >
                    <FileText size={15} aria-hidden="true" />
                    View Invoice
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {orders.length > 0 && (
          <div className="orders-footer-actions page-animate-item">
            <LinkButton to="/rent-products" variant="default" className="bag-btn bag-btn--primary">
              <Package size={16} aria-hidden="true" />
              Rent More Products
            </LinkButton>
          </div>
        )}
      </div>

      <InvoiceViewModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </section>
  )
}

export default OrdersPage
