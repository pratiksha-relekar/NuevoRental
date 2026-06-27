import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
import {
  fetchAdminInvoices,
  getAdminInvoiceStats,
  INVOICE_STATUS_LABELS,
  loadAdminInvoices,
} from '../../data/invoiceStorage'
import { InvoiceDocument } from '../../components/invoice/InvoiceDocument'
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf'
import { InvoiceDetailModal } from '../components/InvoiceDetailModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
const STATUS_TABS = [
  { id: 'all', label: 'All Invoices' },
  { id: 'draft', label: 'Draft' },
  { id: 'paid', label: 'Paid' },
  { id: 'due', label: 'Due' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'overdue', label: 'Overdue' },
]

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'amount-high', label: 'Amount: high to low' },
  { id: 'amount-low', label: 'Amount: low to high' },
]

function AdminInvoicesPage() {
  const [version, setVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [pageSize, setPageSize] = useState(15)
  const [page, setPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [actionMenu, setActionMenu] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pdfInvoice, setPdfInvoice] = useState(null)
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const hiddenInvoiceRef = useRef(null)

  const invoices = useMemo(() => loadAdminInvoices(), [version])
  const stats = useMemo(() => getAdminInvoiceStats(invoices), [invoices])

  useEffect(() => {
    let active = true

    async function loadInvoices() {
      try {
        await fetchAdminInvoices()
        if (active) setVersion((current) => current + 1)
      } catch {
        // Use cached order mirror.
      }
    }

    loadInvoices()
    return () => {
      active = false
    }
  }, [])

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()

    let results = invoices.filter((invoice) => {
      if (activeTab !== 'all' && invoice.status !== activeTab) return false
      if (!query) return true

      const haystack = [
        invoice.id,
        invoice.orderId,
        invoice.customerName,
        invoice.customerEmail,
        invoice.customerCompany,
        invoice.statusLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })

    results = [...results].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (sortBy === 'amount-high') {
        return b.totalAmount - a.totalAmount
      }
      if (sortBy === 'amount-low') {
        return a.totalAmount - b.totalAmount
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return results
  }, [invoices, search, activeTab, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedInvoices = filteredInvoices.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    if (!pdfInvoice || !hiddenInvoiceRef.current) return undefined

    let active = true

    async function exportPdf() {
      setIsPdfDownloading(true)
      try {
        await downloadInvoicePdf(hiddenInvoiceRef.current, `${pdfInvoice.id}.pdf`)
      } catch {
        // View modal is still available if direct export fails.
      } finally {
        if (active) {
          setIsPdfDownloading(false)
          setPdfInvoice(null)
        }
      }
    }

    const timer = window.setTimeout(exportPdf, 120)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [pdfInvoice])

  const handleQuickDownload = (invoice) => {
    setActionMenu(null)
    setPdfInvoice(invoice)
  }

  const handleOpenActionMenu = (invoice, event) => {
    event.stopPropagation()

    if (actionMenu?.invoice.id === invoice.id) {
      setActionMenu(null)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const menuHeight = 92
    const openUp = rect.bottom + menuHeight > window.innerHeight - 16

    setActionMenu({
      invoice,
      top: openUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
      left: Math.max(16, rect.right - 188),
    })
  }

  useEffect(() => {
    setPage(1)
  }, [search, activeTab, sortBy, pageSize])

  useEffect(() => {
    if (!actionMenu) return undefined

    const handlePointerDown = (event) => {
      if (
        !event.target.closest('.admin-invoices-action-menu')
        && !event.target.closest('.admin-invoices-action-btn')
      ) {
        setActionMenu(null)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setActionMenu(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [actionMenu])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchAdminInvoices()
      setVersion((current) => current + 1)
    } finally {
      setIsRefreshing(false)
    }
  }

  const tabCount = (tabId) => {
    if (tabId === 'all') return stats.all ?? invoices.length
    return stats[tabId] ?? 0
  }

  return (
    <div className="admin-invoices-page">
      <header className="admin-invoices-head">
        <div>
          <h1>Invoices</h1>
          <p>
            Auto-generated rental invoices for every customer order. {invoices.length} invoice
            {invoices.length === 1 ? '' : 's'} · {formatINR(stats.totalRevenue)} collected ·{' '}
            {formatINR(stats.outstanding)} outstanding
          </p>
        </div>
        <Button
          type="button"
          className="admin-invoices-create-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <RefreshCw size={16} className="is-spinning" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {isRefreshing ? 'Syncing…' : 'Sync Invoices'}
        </Button>
      </header>

      <section className="admin-invoices-panel">
        <div className="admin-invoices-tabs-row">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="admin-invoices-tabs">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`admin-invoices-tab${activeTab === tab.id ? ' is-active' : ''}`}
                >
                  {tab.label}
                  <span>{tabCount(tab.id)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="admin-invoices-tab-actions">
            <Label className="admin-invoices-sort">
              <ArrowDownUp size={14} aria-hidden="true" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger aria-label="Sort invoices">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <Button type="button" variant="outline" className="admin-invoices-filter-btn">
              <Filter size={14} aria-hidden="true" />
              Filter
            </Button>
          </div>
        </div>

        <div className="admin-invoices-table-toolbar">
          <label className="admin-invoices-search">
            <Search size={16} aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice"
            />
          </label>

          <div className="admin-invoices-table-meta">
            <Label>
              <span>Showing</span>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger aria-label="Results per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <span>
              of {filteredInvoices.length} result{filteredInvoices.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="admin-invoices-table-wrap">
          <Table className="admin-invoices-table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Invoice</TableHead>
                <TableHead scope="col">Client / Customer</TableHead>
                <TableHead scope="col">Total Amount</TableHead>
                <TableHead scope="col">Paid Amount</TableHead>
                <TableHead scope="col">Due Amount</TableHead>
                <TableHead scope="col">Due Date</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="admin-invoices-col-action">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className="admin-invoices-invoice-link"
                      onClick={() => handleQuickDownload(invoice)}
                      disabled={isPdfDownloading && pdfInvoice?.id === invoice.id}
                      aria-label={`Open PDF for ${invoice.id}`}
                    >
                      <div className="admin-invoices-cell-invoice">
                        <strong>{invoice.id}</strong>
                        <span>Created on: {invoice.createdLabel}</span>
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="admin-invoices-cell-client">
                      <strong>{invoice.customerName}</strong>
                      <span>{invoice.customerCompany}</span>
                    </div>
                  </TableCell>
                  <TableCell><strong>{formatINR(invoice.totalAmount)}</strong></TableCell>
                  <TableCell className="is-paid">{formatINR(invoice.paidAmount)}</TableCell>
                  <TableCell className="is-due">{formatINR(invoice.dueAmount)}</TableCell>
                  <TableCell>{invoice.dueDateLabel}</TableCell>
                  <TableCell>
                    <Badge className={`admin-invoices-status admin-invoices-status--${invoice.status}`}>
                      {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="admin-invoices-col-action">
                    <div className="admin-invoices-action-wrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="admin-invoices-action-btn"
                        aria-label={`Actions for ${invoice.id}`}
                        aria-expanded={actionMenu?.invoice.id === invoice.id}
                        onClick={(event) => handleOpenActionMenu(invoice, event)}
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <p className="admin-invoices-empty">
              No invoices match your search or filter. Invoices are created automatically when customers place orders.
            </p>
          )}
        </div>

        {filteredInvoices.length > 0 && (
          <div className="admin-invoices-pagination">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={16} />
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((pageNumber) => {
                if (totalPages <= 7) return true
                if (pageNumber === 1 || pageNumber === totalPages) return true
                return Math.abs(pageNumber - currentPage) <= 1
              })
              .map((pageNumber, index, array) => {
                const prev = array[index - 1]
                const showEllipsis = prev && pageNumber - prev > 1
                return (
                  <span key={pageNumber} className="admin-invoices-page-group">
                    {showEllipsis && <span className="admin-invoices-ellipsis">…</span>}
                    <Button
                      type="button"
                      variant={pageNumber === currentPage ? 'default' : 'outline'}
                      className={pageNumber === currentPage ? 'is-active' : ''}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </span>
                )
              })}

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </section>

      <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />

      {actionMenu && (
        <div
          className="admin-invoices-action-menu"
          style={{ top: `${actionMenu.top}px`, left: `${actionMenu.left}px` }}
          role="menu"
        >
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            onClick={() => {
              setSelectedInvoice(actionMenu.invoice)
              setActionMenu(null)
            }}
          >
            <Eye size={14} aria-hidden="true" />
            View invoice
          </Button>
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            onClick={() => handleQuickDownload(actionMenu.invoice)}
            disabled={isPdfDownloading}
          >
            <FileText size={14} aria-hidden="true" />
            {isPdfDownloading && pdfInvoice?.id === actionMenu.invoice.id ? 'Downloading…' : 'Download PDF'}
          </Button>
        </div>
      )}

      {pdfInvoice && (
        <div className="admin-invoices-pdf-render" aria-hidden="true">
          <InvoiceDocument ref={hiddenInvoiceRef} invoice={pdfInvoice} />
        </div>
      )}
    </div>
  )
}

export default AdminInvoicesPage
