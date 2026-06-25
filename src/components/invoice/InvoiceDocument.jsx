import { forwardRef } from 'react'
import { formatINR } from '../../utils/cartSummary'
import { INVOICE_STATUS_LABELS } from '../../data/invoiceStorage'
import './InvoiceDocument.css'

function lineDiscountPercent(item) {
  const listPrice = item.originalPrice ?? item.rentalPrice ?? item.unitPrice ?? 0
  const unitPrice = item.unitPrice ?? 0
  if (!listPrice || listPrice <= unitPrice) return '0%'
  return `${Math.round(((listPrice - unitPrice) / listPrice) * 100)}%`
}

export const InvoiceDocument = forwardRef(function InvoiceDocument({ invoice }, ref) {
  if (!invoice) return null

  const summary = invoice.summary ?? {}
  const subtotal = Number(summary.totalMrp ?? invoice.totalAmount ?? 0)
  const rentalDiscount = Number(summary.rentalDiscount ?? 0)
  const offerDiscount = Number(summary.nuevoOfferDiscount ?? 0)
  const bulkDiscount = Number(summary.bulkBonusDiscount ?? 0)
  const securityDeposit = Number(summary.securityDeposit ?? 0)
  const totalDiscount = rentalDiscount + offerDiscount + bulkDiscount
  const discountPercent = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0

  return (
    <article ref={ref} className="rental-invoice-doc" aria-label={`Invoice ${invoice.id}`}>
      <header className="rental-invoice-doc__header">
        <div className="rental-invoice-doc__brand">
          <span className="rental-invoice-doc__logo" aria-hidden="true">NR</span>
          <div>
            <strong>{invoice.from?.name ?? 'Nuevo Rental'}</strong>
            <span>IT Equipment Rental</span>
          </div>
        </div>

        <div className="rental-invoice-doc__title-block">
          <h1>Rental Invoice</h1>
          <dl className="rental-invoice-doc__meta">
            <div>
              <dt>Invoice no.</dt>
              <dd>{invoice.id}</dd>
            </div>
            <div>
              <dt>Invoice date</dt>
              <dd>{invoice.createdLabel}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{invoice.dueDateLabel}</dd>
            </div>
            <div>
              <dt>Order ref.</dt>
              <dd>{invoice.orderId}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="rental-invoice-doc__status-row">
        <span className={`rental-invoice-doc__status rental-invoice-doc__status--${invoice.status}`}>
          {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
        </span>
        {invoice.isRecurring && (
          <span className="rental-invoice-doc__badge">Recurring rental plan</span>
        )}
      </div>

      <div className="rental-invoice-doc__parties">
        <section className="rental-invoice-doc__party">
          <h2>From</h2>
          <p className="rental-invoice-doc__party-name">{invoice.from?.name}</p>
          <p>{invoice.from?.contact}</p>
          <p>{invoice.from?.email}</p>
          <p>{invoice.from?.phone}</p>
          <p>{invoice.from?.website}</p>
          <p>{invoice.from?.address}</p>
        </section>

        <div className="rental-invoice-doc__party-stack">
          <section className="rental-invoice-doc__party">
            <h2>Bill to</h2>
            <p className="rental-invoice-doc__party-name">{invoice.customerName}</p>
            <p>{invoice.customerEmail}</p>
            {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
            <p>{invoice.customerCompany}</p>
          </section>

          <section className="rental-invoice-doc__party">
            <h2>Ship to</h2>
            <p>{invoice.shipToAddress}</p>
            {invoice.deliveryDate && (
              <p>
                Delivery: {invoice.deliveryDate}
                {invoice.deliverySlot ? `, ${invoice.deliverySlot}` : ''}
              </p>
            )}
            <p>Track #: {invoice.orderId}</p>
          </section>
        </div>
      </div>

      <div className="rental-invoice-doc__table-wrap">
        <table className="rental-invoice-doc__table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Tax</th>
              <th>Disc</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => {
              const lineTotal = (item.unitPrice ?? 0) * (item.quantity ?? 1)
              return (
                <tr key={item.key ?? item.productId}>
                  <td>
                    <strong>{item.title}</strong>
                    <span>{item.durationLabel ?? 'Rental plan'}</span>
                  </td>
                  <td>{formatINR(item.unitPrice ?? 0)}</td>
                  <td>{item.quantity ?? 1}</td>
                  <td>GST Incl.</td>
                  <td>{lineDiscountPercent(item)}</td>
                  <td>{formatINR(lineTotal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rental-invoice-doc__footer">
        <section className="rental-invoice-doc__notes">
          <h2>Payment instruction</h2>
          <p>
            Payment method: <strong>{invoice.paymentMethodLabel}</strong>
          </p>
          <p>Make payments payable to Nuevo Rental.</p>
          <p>UPI / Bank transfer: support@nuevorental.com</p>
          <p>For billing queries call {invoice.from?.phone}.</p>

          <h2>Notes</h2>
          <p>
            This invoice was auto-generated from rental order {invoice.orderId}. Devices are
            professionally tested, sanitized, and delivered with doorstep setup. GST is included
            in all rental amounts.
          </p>
        </section>

        <section className="rental-invoice-doc__totals">
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            {rentalDiscount > 0 && (
              <div>
                <dt>Duration savings</dt>
                <dd>- {formatINR(rentalDiscount)}</dd>
              </div>
            )}
            {offerDiscount > 0 && (
              <div>
                <dt>Nuevo offer (10%)</dt>
                <dd>- {formatINR(offerDiscount)}</dd>
              </div>
            )}
            {bulkDiscount > 0 && (
              <div>
                <dt>Bulk bonus (5%)</dt>
                <dd>- {formatINR(bulkDiscount)}</dd>
              </div>
            )}
            {totalDiscount > 0 && (
              <div>
                <dt>Discount ({discountPercent}%)</dt>
                <dd>- {formatINR(totalDiscount)}</dd>
              </div>
            )}
            <div>
              <dt>Delivery</dt>
              <dd>FREE</dd>
            </div>
            {securityDeposit > 0 && (
              <div>
                <dt>Security deposit</dt>
                <dd>{formatINR(securityDeposit)}</dd>
              </div>
            )}
            <div className="rental-invoice-doc__total-row">
              <dt>Total</dt>
              <dd>{formatINR(invoice.totalAmount)}</dd>
            </div>
            <div>
              <dt>Amount paid</dt>
              <dd className="is-paid">{formatINR(invoice.paidAmount)}</dd>
            </div>
            <div className="rental-invoice-doc__balance-row">
              <dt>Balance due</dt>
              <dd>{formatINR(invoice.dueAmount)}</dd>
            </div>
          </dl>

          <div className="rental-invoice-doc__signature" aria-hidden="true">
            Nuevo Rental
          </div>
        </section>
      </div>
    </article>
  )
})
