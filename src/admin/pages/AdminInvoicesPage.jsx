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
import { Button } from '@/components/ui/button'
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
import { Tabs } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminIconButton,
  AdminOutlineButton,
  AdminPrimaryButton,
  AdminSearchField,
  AdminStatusBadge,
  AdminTabTrigger,
  AdminTabsList,
  AdminToolbar,
  adminSelectTriggerClass,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'

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

function getInvoiceStatusTone(status) {
  if (status === 'paid' || status === 'recurring') return 'success'
  if (status === 'due') return 'warning'
  if (status === 'overdue') return 'danger'
  return 'neutral'
}

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
        !event.target.closest('[data-admin-invoices-action-menu]')
        && !event.target.closest('[data-admin-invoices-action-btn]')
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
    <AdminPage>
      <AdminPageHeader
        title="Invoices"
        description={
          <>
            Auto-generated rental invoices for every customer order. {invoices.length} invoice
            {invoices.length === 1 ? '' : 's'} · {formatINR(stats.totalRevenue)} collected ·{' '}
            {formatINR(stats.outstanding)} outstanding
          </>
        }
        actions={
          <AdminPrimaryButton onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus size={16} aria-hidden="true" />
            )}
            {isRefreshing ? 'Syncing…' : 'Sync Invoices'}
          </AdminPrimaryButton>
        }
      />

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 w-full lg:w-auto">
            <AdminTabsList className="admin-invoices-tabs w-full max-lg:overflow-x-auto max-lg:flex-nowrap max-lg:[-webkit-overflow-scrolling:touch] lg:flex-wrap">
              {STATUS_TABS.map((tab) => (
                <AdminTabTrigger key={tab.id} value={tab.id} count={tabCount(tab.id)}>
                  {tab.label}
                </AdminTabTrigger>
              ))}
            </AdminTabsList>
          </Tabs>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Label className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#666] uppercase">
              <ArrowDownUp size={14} aria-hidden="true" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={cn(adminSelectTriggerClass, 'w-[180px]')} aria-label="Sort invoices">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <AdminOutlineButton>
              <Filter size={14} aria-hidden="true" />
              Filter
            </AdminOutlineButton>
          </div>
        </div>

        <AdminToolbar className="lg:justify-between">
          <AdminSearchField
            icon={Search}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice"
          />

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#666]">
            <Label className="inline-flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-[#666] uppercase">Showing</span>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className={cn(adminSelectTriggerClass, 'w-[72px]')} aria-label="Results per page">
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
        </AdminToolbar>

        <div className={adminTableWrapClass}>
          <Table className={adminTableClass}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Invoice</TableHead>
                <TableHead scope="col">Client / Customer</TableHead>
                <TableHead scope="col">Total Amount</TableHead>
                <TableHead scope="col">Paid Amount</TableHead>
                <TableHead scope="col">Due Amount</TableHead>
                <TableHead scope="col">Due Date</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="w-[72px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto rounded-none px-0 py-0 text-left hover:bg-transparent"
                      onClick={() => handleQuickDownload(invoice)}
                      disabled={isPdfDownloading && pdfInvoice?.id === invoice.id}
                      aria-label={`Open PDF for ${invoice.id}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-sm text-[#1a1a1a] hover:underline">{invoice.id}</strong>
                        <span className="text-xs text-[#888]">Created on: {invoice.createdLabel}</span>
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-sm text-[#1a1a1a]">{invoice.customerName}</strong>
                      <span className="text-xs text-[#888]">{invoice.customerCompany}</span>
                    </div>
                  </TableCell>
                  <TableCell><strong className="text-sm text-[#1a1a1a]">{formatINR(invoice.totalAmount)}</strong></TableCell>
                  <TableCell className="text-[#1f6b3a]">{formatINR(invoice.paidAmount)}</TableCell>
                  <TableCell className="text-[#a94442]">{formatINR(invoice.dueAmount)}</TableCell>
                  <TableCell>{invoice.dueDateLabel}</TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={getInvoiceStatusTone(invoice.status)}>
                      {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <AdminIconButton
                        data-admin-invoices-action-btn
                        aria-label={`Actions for ${invoice.id}`}
                        aria-expanded={actionMenu?.invoice.id === invoice.id}
                        onClick={(event) => handleOpenActionMenu(invoice, event)}
                      >
                        <MoreVertical size={16} />
                      </AdminIconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <AdminEmptyState>
              No invoices match your search or filter. Invoices are created automatically when customers place orders.
            </AdminEmptyState>
          )}
        </div>

        {filteredInvoices.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#e5e5e5] p-4">
            <Button
              type="button"
              variant="adminOutline"
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
                  <span key={pageNumber} className="inline-flex items-center gap-1">
                    {showEllipsis && <span className="px-1 text-sm text-[#888]">…</span>}
                    <Button
                      type="button"
                      variant={pageNumber === currentPage ? 'admin' : 'adminOutline'}
                      size="admin"
                      className="size-8 rounded-none p-0 text-xs font-semibold"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </span>
                )
              })}

            <Button
              type="button"
              variant="adminOutline"
              size="icon-sm"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </AdminPanel>

      <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />

      {actionMenu && (
        <div
          className="fixed z-50 flex min-w-[180px] flex-col border border-[#e5e5e5] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ top: `${actionMenu.top}px`, left: `${actionMenu.left}px` }}
          data-admin-invoices-action-menu
          role="menu"
        >
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className="h-9 justify-start rounded-none px-3 text-sm font-normal text-[#1a1a1a] hover:bg-[#fafafa]"
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
            className="h-9 justify-start rounded-none px-3 text-sm font-normal text-[#1a1a1a] hover:bg-[#fafafa]"
            onClick={() => handleQuickDownload(actionMenu.invoice)}
            disabled={isPdfDownloading}
          >
            <FileText size={14} aria-hidden="true" />
            {isPdfDownloading && pdfInvoice?.id === actionMenu.invoice.id ? 'Downloading…' : 'Download PDF'}
          </Button>
        </div>
      )}

      {pdfInvoice && (
        <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden="true">
          <InvoiceDocument ref={hiddenInvoiceRef} invoice={pdfInvoice} />
        </div>
      )}
    </AdminPage>
  )
}

export default AdminInvoicesPage
