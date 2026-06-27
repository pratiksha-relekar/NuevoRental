import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function LinkButton({ variant = 'default', size = 'default', className, ...props }) {
  return (
    <Button
      render={<Link />}
      variant={variant}
      size={size}
      className={cn('no-underline', className)}
      {...props}
    />
  )
}

export { LinkButton, buttonVariants }
