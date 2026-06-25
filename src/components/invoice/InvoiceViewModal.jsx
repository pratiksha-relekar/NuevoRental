import { useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { InvoiceDocument } from './InvoiceDocument'
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf'
import './InvoiceViewModal.css'

export function InvoiceViewModal({ invoice, onClose }) {
  const invoiceRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  if (!invoice) return null

  const handleDownload = async () => {
    setDownloadError('')
    setIsDownloading(true)

    try {
      await downloadInvoicePdf(invoiceRef.current, `${invoice.id}.pdf`)
    } catch {
      setDownloadError('Unable to download PDF right now. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="invoice-view-modal-root" role="presentation">
      <button type="button" className="invoice-view-modal-scrim" onClick={onClose} aria-label="Close invoice" />
      <div
        className="invoice-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-view-title"
      >
        <div className="invoice-view-modal-toolbar">
          <div>
            <span className="invoice-view-modal-eyebrow">{invoice.orderId}</span>
            <h2 id="invoice-view-title">{invoice.id}</h2>
          </div>

          <div className="invoice-view-modal-actions">
            <button
              type="button"
              className="invoice-view-modal-download"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={16} aria-hidden="true" />
              {isDownloading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button type="button" className="invoice-view-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {downloadError && (
          <p className="invoice-view-modal-error" role="alert">{downloadError}</p>
        )}

        <div className="invoice-view-modal-preview">
          <InvoiceDocument ref={invoiceRef} invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
