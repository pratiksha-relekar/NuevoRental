import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceDocument } from './InvoiceDocument'
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf'

export function InvoiceViewModal({ invoice, onClose }) {
  const invoiceRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    if (!invoice) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [invoice, onClose])

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

  return createPortal(
    <div
      className="invoice-view-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-view-title"
    >
      <button
        type="button"
        className="invoice-view-modal-scrim"
        aria-label="Close invoice"
        onClick={onClose}
      />

      <div className="invoice-view-modal">
        <div className="invoice-view-modal-toolbar">
          <div className="invoice-view-modal-heading">
            <span className="invoice-view-modal-eyebrow">{invoice.orderId}</span>
            <h2 id="invoice-view-title">{invoice.id}</h2>
          </div>

          <div className="invoice-view-modal-actions">
            <Button
              type="button"
              variant="default"
              className="invoice-view-modal-download"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={16} aria-hidden="true" />
              {isDownloading ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="invoice-view-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {downloadError && (
          <p className="invoice-view-modal-error" role="alert">{downloadError}</p>
        )}

        <div className="invoice-view-modal-preview">
          <InvoiceDocument ref={invoiceRef} invoice={invoice} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
