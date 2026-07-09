import { useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { InvoiceDocument } from './InvoiceDocument'
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf'

const invoiceDialogClass =
  'invoice-view-modal max-h-[min(94vh,920px)] w-[min(calc(100vw-2rem),980px)] max-w-[980px] gap-0 overflow-auto rounded-[18px] border border-[#e8edf2] bg-[#eef2f7] p-[18px] sm:max-w-[980px]'
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
        className={cn(invoiceDialogClass, 'grid-cols-1')}
        showCloseButton={false}
      >
        <div className="invoice-view-modal-toolbar">
          <div>
            <span className="invoice-view-modal-eyebrow">{invoice.orderId}</span>
            <DialogTitle id="invoice-view-title" className="text-xl font-bold text-[#1a2744]">
              {invoice.id}
            </DialogTitle>
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
      </DialogContent>
    </Dialog>
  )
}
