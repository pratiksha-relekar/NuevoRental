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
import './AdminWeeklyOffersPage.css'

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
        <button
          type="button"
          className="admin-weekly-offers-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'is-spinning' : ''} aria-hidden="true" />
          {isRefreshing ? 'Syncing…' : 'Sync offers'}
        </button>
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
          <label>
            <span>Ends on</span>
            <input
              type="datetime-local"
              value={timerValue}
              onChange={(e) => setTimerValue(e.target.value)}
            />
          </label>
          <button type="submit" disabled={timerSaving}>
            {timerSaving ? 'Saving…' : 'Save timer'}
          </button>
        </form>

        {timerMessage && <p className="admin-weekly-offers-timer-message">{timerMessage}</p>}
      </section>

      <section className="admin-weekly-offers-panel">
        <div className="admin-weekly-offers-panel-head">
          <div>
            <h2>Offer products</h2>
            <p>{deals.length} active offer{deals.length === 1 ? '' : 's'} on the homepage.</p>
          </div>
          <button
            type="button"
            className="admin-weekly-offers-add-btn"
            onClick={() => setOfferModal({ mode: 'create' })}
          >
            <Plus size={16} aria-hidden="true" />
            Add offer
          </button>
        </div>

        <div className="admin-weekly-offers-table-wrap">
          <table className="admin-weekly-offers-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Discount</th>
                <th scope="col">Offer price</th>
                <th scope="col">Stock</th>
                <th scope="col">Source</th>
                <th scope="col" className="admin-weekly-offers-col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td>
                    <div className="admin-weekly-offers-product">
                      <img src={deal.image} alt="" />
                      <div>
                        <strong>{deal.title}</strong>
                        <span>{deal.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{deal.discountPercent}% OFF</td>
                  <td>
                    <strong>{formatINR(deal.offerPrice)}</strong>
                    <span className="admin-weekly-offers-original">{formatINR(deal.originalPrice)}</span>
                  </td>
                  <td>{deal.inStock ? `In stock (${deal.stock})` : 'Hidden'}</td>
                  <td>
                    <span className={`admin-weekly-offers-source${storedIds.has(deal.id) ? ' is-custom' : ''}`}>
                      {storedIds.has(deal.id) ? 'Admin updated' : 'Default'}
                    </span>
                  </td>
                  <td className="admin-weekly-offers-col-action">
                    <div className="admin-weekly-offers-actions">
                      <button
                        type="button"
                        aria-label={`Edit ${deal.title}`}
                        onClick={() => setOfferModal({ mode: 'edit', deal })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${deal.title}`}
                        onClick={() => handleDelete(deal)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
