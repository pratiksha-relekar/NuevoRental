import { cn } from '../../lib/utils'
import './card.css'

function Card({ className, ...props }) {
  return <div className={cn('ui-card', className)} {...props} />
}

function CardHeader({ className, ...props }) {
  return <div className={cn('ui-card-header', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn('ui-card-title', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('ui-card-description', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('ui-card-content', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
