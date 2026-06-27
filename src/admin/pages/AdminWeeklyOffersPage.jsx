import { useEffect, useMemo, useState } from 'react'
import { Clock3, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useWeeklyOffers } from '../../context/WeeklyOffersContext'
import { formatINR } from '../../utils/cartSummary'
import {
  fromCountdownInputValue,
  toCountdownInputValue,
  WeeklyOfferFormModal,
} from '../components/WeeklyOfferFormModal'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminIconButton,
  AdminPrimaryButton,
  AdminSectionTitle,
  AdminStatusBadge,
  adminInputClass,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function AdminWeeklyOffersPage() {
  const { products, categories } = useCatalog()
  const {
    deals,
    storedDeals,
    config,
    saveDeal,
    removeDeal,
    hideDefaultDeal,
    saveConfig,
    refreshWeeklyOffers,
    defaultDeals,
  } = useWeeklyOffers()

  const [offerModal, setOfferModal] = useState(null)
  const [timerValue, setTimerValue] = useState(() => toCountdownInputValue(config.endsAt))
  const [timerMessage, setTimerMessage] = useState('')
  const [timerSaving, setTimerSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setTimerValue(toCountdownInputValue(config.endsAt))
  }, [config.endsAt])

  const storedIds = useMemo(() => new Set(storedDeals.map((deal) => deal.id)), [storedDeals])
  const defaultIds = useMemo(() => new Set(defaultDeals.map((deal) => deal.id)), [defaultDeals])

  const handleSaveTimer = async (event) => {
    event.preventDefault()
    setTimerMessage('')
    setTimerSaving(true)

    const endsAt = fromCountdownInputValue(timerValue)
    if (!endsAt) {
      setTimerMessage('Choose a valid countdown end date and time.')
      setTimerSaving(false)
      return
    }

    const result = await saveConfig({ endsAt })
    setTimerSaving(false)
    setTimerMessage(result.ok ? 'Countdown timer updated.' : result.error)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshWeeklyOffers()
    setIsRefreshing(false)
  }

  const handleDelete = async (deal) => {
    const isDefault = defaultIds.has(deal.id)
    const message = isDefault
      ? `Hide "${deal.title}" from Weekly Best Deals?`
      : `Delete "${deal.title}" from weekly offers?`
    if (!window.confirm(message)) return

    const result = isDefault ? await hideDefaultDeal(deal.id) : await removeDeal(deal.id)
    if (!result.ok) window.alert(result.error)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Weekly Offers"
        description="Manage the homepage Weekly Best Deals carousel, countdown timer, and featured rental offers. Default catalog deals stay available until you edit or hide them."
        actions={
          <AdminPrimaryButton onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw size={16} className={cn(isRefreshing && 'animate-spin')} aria-hidden="true" />
            {isRefreshing ? 'Syncing…' : 'Sync offers'}
          </AdminPrimaryButton>
        }
      />

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-[#1a1a1a]">
              <Clock3 size={18} aria-hidden="true" />
            </span>
            <div>
              <AdminSectionTitle className="normal-case">Countdown timer</AdminSectionTitle>
              <p className="mt-1 text-sm text-[#666]">
                Set when the &ldquo;Limited time only!&rdquo; offer ends on the homepage.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSaveTimer}>
            <Label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666]">
              <span>Ends on</span>
              <Input
                type="datetime-local"
                className={adminInputClass}
                value={timerValue}
                onChange={(e) => setTimerValue(e.target.value)}
              />
            </Label>
            <AdminPrimaryButton type="submit" disabled={timerSaving}>
              {timerSaving ? 'Saving…' : 'Save timer'}
            </AdminPrimaryButton>
          </form>
        </div>

        {timerMessage ? (
          <p
            className={cn(
              'border-t border-[#e5e5e5] px-4 py-3 text-sm',
              timerMessage.includes('updated') ? 'text-[#1f6b3a]' : 'text-[#a94442]',
            )}
          >
            {timerMessage}
          </p>
        ) : null}
      </AdminPanel>

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminSectionTitle className="normal-case">Offer products</AdminSectionTitle>
            <p className="mt-1 text-sm text-[#666]">
              {deals.length} active offer{deals.length === 1 ? '' : 's'} on the homepage.
            </p>
          </div>
          <AdminPrimaryButton type="button" className="gap-2" onClick={() => setOfferModal({ mode: 'create' })}>
            <Plus size={16} aria-hidden="true" />
            Add offer
          </AdminPrimaryButton>
        </div>

        <div className={adminTableWrapClass}>
          <Table className={adminTableClass}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Product</TableHead>
                <TableHead scope="col">Discount</TableHead>
                <TableHead scope="col">Offer price</TableHead>
                <TableHead scope="col">Stock</TableHead>
                <TableHead scope="col">Source</TableHead>
                <TableHead scope="col" className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.image}
                        alt=""
                        className="size-12 shrink-0 border border-[#e5e5e5] object-cover"
                      />
                      <div className="min-w-0">
                        <strong className="block text-sm text-[#1a1a1a]">{deal.title}</strong>
                        <span className="block truncate text-xs text-[#888]">{deal.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{deal.discountPercent}% OFF</TableCell>
                  <TableCell>
                    <strong className="block text-sm text-[#1a1a1a]">{formatINR(deal.offerPrice)}</strong>
                    <span className="text-xs text-[#888] line-through">{formatINR(deal.originalPrice)}</span>
                  </TableCell>
                  <TableCell>{deal.inStock ? `In stock (${deal.stock})` : 'Hidden'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={storedIds.has(deal.id) ? 'info' : 'neutral'}>
                      {storedIds.has(deal.id) ? 'Admin updated' : 'Default'}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <AdminIconButton
                        aria-label={`Edit ${deal.title}`}
                        onClick={() => setOfferModal({ mode: 'edit', deal })}
                      >
                        <Pencil size={15} />
                      </AdminIconButton>
                      <AdminIconButton
                        danger
                        aria-label={`Remove ${deal.title}`}
                        onClick={() => handleDelete(deal)}
                      >
                        <Trash2 size={15} />
                      </AdminIconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminPanel>

      {offerModal ? (
        <WeeklyOfferFormModal
          deal={offerModal.mode === 'edit' ? offerModal.deal : null}
          products={products}
          categories={categories}
          onClose={() => setOfferModal(null)}
          onSave={saveDeal}
        />
      ) : null}
    </AdminPage>
  )
}

export default AdminWeeklyOffersPage
