import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Router Link styled as a shadcn Button.
 */
function LinkButton({ variant = 'default', size = 'default', className, ...props }) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { LinkButton }
