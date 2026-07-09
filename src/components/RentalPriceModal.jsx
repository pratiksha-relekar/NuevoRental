import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

function RentalPriceModal({ open, plans, selectedPlanId, onSelect, onClose }) {
  useEffect(() => {
    if (!open) return undefined

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
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="rental-price-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rental-price-modal-title"
    >
      <button
        type="button"
        className="rental-price-modal-backdrop"
        aria-label="Close plan selector"
        onClick={onClose}
      />

      <div className="rental-price-modal">
        <div className="rental-price-modal-header">
          <h2 id="rental-price-modal-title">Select Project Plan</h2>
          <Button
            type="button"
            variant="outline"
            className="rental-price-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={22} />
          </Button>
        </div>

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
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    variant="default"
                    className="rental-price-card-select"
                    onClick={() => onSelect(plan.id)}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </motion.div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RentalPriceModal
