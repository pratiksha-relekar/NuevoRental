import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
function RentalPriceModal({ open, plans, selectedPlanId, onSelect, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent
        className="rental-price-modal"
        showCloseButton={false}
      >
        <DialogHeader className="rental-price-modal-header">
          <DialogTitle id="rental-price-modal-title">Select Project Plan</DialogTitle>
          <Button
            type="button"
            variant="outline"
            className="rental-price-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={22} />
          </Button>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}

export default RentalPriceModal
