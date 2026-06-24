import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import './RentalPriceModal.css'

function RentalPriceModal({ open, plans, selectedPlanId, onSelect, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="rental-price-modal-root" role="presentation">
          <motion.button
            type="button"
            className="rental-price-modal-backdrop"
            aria-label="Close rental price selector"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            className="rental-price-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-price-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="rental-price-modal-header">
              <h2 id="rental-price-modal-title">Select Project Plan</h2>
              <button
                type="button"
                className="rental-price-modal-close"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </header>

            <div className="rental-price-modal-grid">
              {plans.map((plan, index) => {
                const isSelected = plan.id === selectedPlanId

                return (
                  <motion.article
                    key={plan.id}
                    className={`rental-price-card${isSelected ? ' rental-price-card--selected' : ''}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(74, 144, 226, 0.12)' }}
                  >
                    <p className="rental-price-card-duration">{plan.durationLabel}</p>
                    <p className="rental-price-card-price">{plan.priceLabel}</p>
                    <motion.button
                      type="button"
                      className="rental-price-card-select"
                      onClick={() => onSelect(plan.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </motion.button>
                  </motion.article>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default RentalPriceModal
