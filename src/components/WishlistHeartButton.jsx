import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const iconSizes = {
  pdp: 16,
  product: 14,
  header: 18,
}

function WishlistHeartButton({
  active = false,
  onClick,
  variant = 'pdp',
  className,
  'aria-label': ariaLabel,
  ...props
}) {
  const [burstKey, setBurstKey] = useState(0)

  const handleClick = (event) => {
    if (!active) {
      setBurstKey((current) => current + 1)
    }
    onClick?.(event)
  }

  const iconSize = iconSizes[variant] ?? 18

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'wishlist-heart-btn',
        `wishlist-heart-btn--${variant}`,
        active && 'wishlist-heart-btn--active',
        className,
      )}
      aria-label={ariaLabel ?? (active ? 'Remove from wishlist' : 'Add to wishlist')}
      aria-pressed={active}
      onClick={handleClick}
      {...props}
    >
      <span className="wishlist-heart-btn__glow" aria-hidden="true" />
      <span className="wishlist-heart-btn__ring" aria-hidden="true" />

      <motion.span
        className="wishlist-heart-btn__icon-wrap"
        key={active ? 'active' : 'idle'}
        initial={false}
        animate={
          active
            ? { scale: [1, 1.28, 0.96, 1.06, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Heart
          size={iconSize}
          fill={active ? 'currentColor' : 'none'}
          strokeWidth={active ? 1.75 : 2}
          className="wishlist-heart-btn__icon"
        />
      </motion.span>

      <AnimatePresence mode="popLayout">
        {burstKey > 0 && (
          <span key={burstKey} className="wishlist-heart-btn__particles" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * Math.PI * 2
              const distance = variant === 'pdp' ? 16 : 14

              return (
                <motion.span
                  key={index}
                  className="wishlist-heart-btn__particle"
                  initial={{ opacity: 0.95, scale: 0.2, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              )
            })}
          </span>
        )}
      </AnimatePresence>
    </Button>
  )
}

export default WishlistHeartButton
