import { useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceDocument } from './InvoiceDocument'
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf'
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
    <Dialog open={Boolean(invoice)} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent
        className="invoice-view-modal"
        showCloseButton={false}
      >
        <DialogHeader className="invoice-view-modal-toolbar">
          <div>
            <span className="invoice-view-modal-eyebrow">{invoice.orderId}</span>
            <DialogTitle id="invoice-view-title">{invoice.id}</DialogTitle>
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
        </DialogHeader>

        {downloadError && (
          <p className="invoice-view-modal-error" role="alert">{downloadError}</p>
        )}

        <div className="invoice-view-modal-preview">
          <InvoiceDocument ref={invoiceRef} invoice={invoice} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
