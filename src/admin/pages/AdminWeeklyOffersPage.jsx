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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="admin-weekly-offers-page">
      <header className="admin-weekly-offers-head">
        <div>
          <h1>Weekly Offers</h1>
          <p>
            Manage the homepage Weekly Best Deals carousel, countdown timer, and featured rental
            offers. Default catalog deals stay available until you edit or hide them.
          </p>
        </div>
        <Button
          type="button"
          className="admin-weekly-offers-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'is-spinning' : ''} aria-hidden="true" />
          {isRefreshing ? 'Syncing…' : 'Sync offers'}
        </Button>
      </header>

      <section className="admin-weekly-offers-timer-card">
        <div className="admin-weekly-offers-timer-copy">
          <span className="admin-weekly-offers-timer-icon" aria-hidden="true">
            <Clock3 size={18} />
          </span>
          <div>
            <h2>Countdown timer</h2>
            <p>Set when the “Limited time only!” offer ends on the homepage.</p>
          </div>
        </div>

        <form className="admin-weekly-offers-timer-form" onSubmit={handleSaveTimer}>
          <Label>
            <span>Ends on</span>
            <Input
              type="datetime-local"
              value={timerValue}
              onChange={(e) => setTimerValue(e.target.value)}
            />
          </Label>
          <Button type="submit" disabled={timerSaving}>
            {timerSaving ? 'Saving…' : 'Save timer'}
          </Button>
        </form>

        {timerMessage && <p className="admin-weekly-offers-timer-message">{timerMessage}</p>}
      </section>

      <section className="admin-weekly-offers-panel">
        <div className="admin-weekly-offers-panel-head">
          <div>
            <h2>Offer products</h2>
            <p>{deals.length} active offer{deals.length === 1 ? '' : 's'} on the homepage.</p>
          </div>
          <Button
            type="button"
            className="admin-weekly-offers-add-btn"
            onClick={() => setOfferModal({ mode: 'create' })}
          >
            <Plus size={16} aria-hidden="true" />
            Add offer
          </Button>
        </div>

        <div className="admin-weekly-offers-table-wrap">
          <Table className="admin-weekly-offers-table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Product</TableHead>
                <TableHead scope="col">Discount</TableHead>
                <TableHead scope="col">Offer price</TableHead>
                <TableHead scope="col">Stock</TableHead>
                <TableHead scope="col">Source</TableHead>
                <TableHead scope="col" className="admin-weekly-offers-col-action">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div className="admin-weekly-offers-product">
                      <img src={deal.image} alt="" />
                      <div>
                        <strong>{deal.title}</strong>
                        <span>{deal.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{deal.discountPercent}% OFF</TableCell>
                  <TableCell>
                    <strong>{formatINR(deal.offerPrice)}</strong>
                    <span className="admin-weekly-offers-original">{formatINR(deal.originalPrice)}</span>
                  </TableCell>
                  <TableCell>{deal.inStock ? `In stock (${deal.stock})` : 'Hidden'}</TableCell>
                  <TableCell>
                    <Badge className={`admin-weekly-offers-source${storedIds.has(deal.id) ? ' is-custom' : ''}`}>
                      {storedIds.has(deal.id) ? 'Admin updated' : 'Default'}
                    </Badge>
                  </TableCell>
                  <TableCell className="admin-weekly-offers-col-action">
                    <div className="admin-weekly-offers-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${deal.title}`}
                        onClick={() => setOfferModal({ mode: 'edit', deal })}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${deal.title}`}
                        onClick={() => handleDelete(deal)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {offerModal && (
        <WeeklyOfferFormModal
          deal={offerModal.mode === 'edit' ? offerModal.deal : null}
          products={products}
          categories={categories}
          onClose={() => setOfferModal(null)}
          onSave={saveDeal}
        />
      )}
    </div>
  )
}

export default AdminWeeklyOffersPage
