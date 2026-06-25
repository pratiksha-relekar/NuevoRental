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
import './AdminInvoicesPage.css'

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
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
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
    setOpenMenuId(null)
    setPdfInvoice(invoice)
  }

  useEffect(() => {
    setPage(1)
  }, [search, activeTab, sortBy, pageSize])

  useEffect(() => {
    if (!openMenuId) return undefined

    const handlePointerDown = (event) => {
      if (!event.target.closest('.admin-invoices-action-wrap')) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [openMenuId])

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedInvoices.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(paginatedInvoices.map((invoice) => invoice.id))
  }

  const toggleSelect = (invoiceId) => {
    setSelectedIds((current) =>
      current.includes(invoiceId)
        ? current.filter((id) => id !== invoiceId)
        : [...current, invoiceId],
    )
  }

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
        <button
          type="button"
          className="admin-invoices-create-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <RefreshCw size={16} className="is-spinning" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {isRefreshing ? 'Syncing…' : 'Sync Invoices'}
        </button>
      </header>

      <section className="admin-invoices-panel">
        <div className="admin-invoices-tabs-row">
          <div className="admin-invoices-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-invoices-tab${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span>{tabCount(tab.id)}</span>
              </button>
            ))}
          </div>

          <div className="admin-invoices-tab-actions">
            <label className="admin-invoices-sort">
              <ArrowDownUp size={14} aria-hidden="true" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort invoices">
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" className="admin-invoices-filter-btn">
              <Filter size={14} aria-hidden="true" />
              Filter
            </button>
          </div>
        </div>

        <div className="admin-invoices-table-toolbar">
          <label className="admin-invoices-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice"
            />
          </label>

          <div className="admin-invoices-table-meta">
            <label>
              <span>Showing</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="Results per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <span>
              of {filteredInvoices.length} result{filteredInvoices.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="admin-invoices-table-wrap">
          <table className="admin-invoices-table">
            <thead>
              <tr>
                <th scope="col" className="admin-invoices-col-check">
                  <input
                    type="checkbox"
                    aria-label="Select all invoices on this page"
                    checked={paginatedInvoices.length > 0 && selectedIds.length === paginatedInvoices.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th scope="col">Invoice</th>
                <th scope="col">Client / Customer</th>
                <th scope="col">Total Amount</th>
                <th scope="col">Paid Amount</th>
                <th scope="col">Due Amount</th>
                <th scope="col">Due Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="admin-invoices-col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((invoice, index) => {
                const isLastRow = index === paginatedInvoices.length - 1
                const isMenuOpen = openMenuId === invoice.id

                return (
                <tr key={invoice.id} className={isMenuOpen && isLastRow ? 'has-open-menu' : ''}>
                  <td className="admin-invoices-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${invoice.id}`}
                      checked={selectedIds.includes(invoice.id)}
                      onChange={() => toggleSelect(invoice.id)}
                    />
                  </td>
                  <td>
                    <div className="admin-invoices-cell-invoice">
                      <strong>{invoice.id}</strong>
                      <span>Created on: {invoice.createdLabel}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-invoices-cell-client">
                      <strong>{invoice.customerName}</strong>
                      <span>{invoice.customerCompany}</span>
                    </div>
                  </td>
                  <td><strong>{formatINR(invoice.totalAmount)}</strong></td>
                  <td className="is-paid">{formatINR(invoice.paidAmount)}</td>
                  <td className="is-due">{formatINR(invoice.dueAmount)}</td>
                  <td>{invoice.dueDateLabel}</td>
                  <td>
                    <span className={`admin-invoices-status admin-invoices-status--${invoice.status}`}>
                      {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                    </span>
                  </td>
                  <td className="admin-invoices-col-action">
                    <div className="admin-invoices-action-wrap">
                      <button
                        type="button"
                        className="admin-invoices-action-btn"
                        aria-label={`Actions for ${invoice.id}`}
                        onClick={() => setOpenMenuId((current) => (current === invoice.id ? null : invoice.id))}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {isMenuOpen && (
                        <div
                          className={`admin-invoices-action-menu${isLastRow ? ' is-up' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setOpenMenuId(null)
                            }}
                          >
                            <Eye size={14} aria-hidden="true" />
                            View invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDownload(invoice)}
                            disabled={isPdfDownloading}
                          >
                            <FileText size={14} aria-hidden="true" />
                            {isPdfDownloading && pdfInvoice?.id === invoice.id ? 'Downloading…' : 'Download PDF'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <p className="admin-invoices-empty">
              No invoices match your search or filter. Invoices are created automatically when customers place orders.
            </p>
          )}
        </div>

        {filteredInvoices.length > 0 && (
          <div className="admin-invoices-pagination">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={16} />
            </button>

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
                    <button
                      type="button"
                      className={pageNumber === currentPage ? 'is-active' : ''}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </span>
                )
              })}

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />

      {pdfInvoice && (
        <div className="admin-invoices-pdf-render" aria-hidden="true">
          <InvoiceDocument ref={hiddenInvoiceRef} invoice={pdfInvoice} />
        </div>
      )}
    </div>
  )
}

export default AdminInvoicesPage
