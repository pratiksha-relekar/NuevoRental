import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export const adminInputClass =
  'h-10 rounded-none border-[#ddd] bg-[#fafafa] px-3 text-sm text-[#1a1a1a] placeholder:text-[#aaa] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8'

export const adminSelectTriggerClass =
  'h-10 rounded-none border-[#ddd] bg-white px-3 text-sm text-[#1a1a1a] focus-visible:border-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/8'

/** @deprecated Use `<Button variant="admin" size="admin" />` */
export const adminPrimaryBtnClass = ''

/** @deprecated Use `<Button variant="adminOutline" size="admin" />` */
export const adminOutlineBtnClass = ''

/** @deprecated Use `<Button variant="adminIcon" size="icon-sm" />` */
export const adminIconBtnClass = ''

/** @deprecated Use `<Button variant="adminIconDanger" size="icon-sm" />` */
export const adminIconBtnDangerClass = ''

export const adminPanelClass = 'border border-[#e5e5e5] bg-white'

export const adminTableWrapClass = 'overflow-x-auto border-t border-[#e5e5e5]'

export const adminTableClass =
  '[&_th]:h-11 [&_th]:border-b [&_th]:border-[#e5e5e5] [&_th]:bg-[#fafafa] [&_th]:px-4 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-[#666] [&_th]:uppercase [&_td]:border-b [&_td]:border-[#efefef] [&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_tr:last-child_td]:border-b-0'

export function AdminPage({ children, className }) {
  return <div className={cn('flex flex-col gap-6', className)}>{children}</div>
}

export function AdminPageHeader({ title, description, actions, className }) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="text-[clamp(22px,2.5vw,28px)] font-bold tracking-tight text-[#1a1a1a]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#666]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function AdminPanel({ children, className }) {
  return <section className={cn(adminPanelClass, className)}>{children}</section>
}

export function AdminToolbar({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-[#e5e5e5] p-4 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AdminTabsList({ children, className }) {
  return (
    <TabsList
      className={cn(
        'h-auto gap-1 rounded-none border border-[#e5e5e5] bg-[#fafafa] p-1',
        className,
      )}
    >
      {children}
    </TabsList>
  )
}

export function AdminTabTrigger({ children, className, count, ...props }) {
  return (
    <TabsTrigger
      className={cn(
        'group/admin-tab h-9 gap-2 rounded-none border border-transparent bg-transparent px-3 text-xs font-semibold tracking-wide text-[#666] uppercase data-[state=active]:border-[#1a1a1a] data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white',
        className,
      )}
      {...props}
    >
      {children}
      {count != null ? (
        <span className="inline-flex min-w-5 items-center justify-center bg-[#ececec] px-1.5 py-0.5 text-[10px] font-bold text-[#1a1a1a] group-data-[state=active]/admin-tab:bg-white/20 group-data-[state=active]/admin-tab:text-white">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  )
}

export function AdminSearchField({ icon: Icon, className, ...props }) {
  return (
    <label className={cn('relative flex min-w-[220px] flex-1 items-center lg:max-w-sm', className)}>
      {Icon ? <Icon className="pointer-events-none absolute left-3 size-4 text-[#999]" aria-hidden="true" /> : null}
      <Input className={cn(adminInputClass, Icon && 'pl-9', 'w-full')} {...props} />
    </label>
  )
}

export function AdminPrimaryButton({ children, className, ...props }) {
  return (
    <Button type="button" variant="admin" size="admin" className={className} {...props}>
      {children}
    </Button>
  )
}

export function AdminOutlineButton({ children, className, ...props }) {
  return (
    <Button type="button" variant="adminOutline" size="admin" className={className} {...props}>
      {children}
    </Button>
  )
}

export function AdminIconButton({ children, className, danger = false, ...props }) {
  return (
    <Button
      type="button"
      variant={danger ? 'adminIconDanger' : 'adminIcon'}
      size="icon-sm"
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

export function AdminEmptyState({ children, className }) {
  return (
    <p className={cn('border-t border-[#e5e5e5] px-4 py-10 text-center text-sm text-[#666]', className)}>
      {children}
    </p>
  )
}

export function AdminStatusBadge({ tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'border-[#ddd] bg-[#f5f5f5] text-[#444]',
    success: 'border-[#b8dfc4] bg-[#eef8f0] text-[#1f6b3a]',
    warning: 'border-[#f0d9a8] bg-[#fff8ea] text-[#8a6200]',
    danger: 'border-[#f0caca] bg-[#fdf2f2] text-[#a94442]',
    info: 'border-[#c8daf5] bg-[#eef4fd] text-[#245ea8]',
    dark: 'border-[#1a1a1a] bg-[#1a1a1a] text-white',
  }

  return (
    <Badge
      variant="outline"
      className={cn('rounded-none px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase', tones[tone], className)}
    >
      {children}
    </Badge>
  )
}

export function AdminStatCard({ icon: Icon, label, value, trend, note = 'vs last 7 days' }) {
  return (
    <section className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-[#1a1a1a]">
          {Icon ? <Icon size={18} strokeWidth={1.8} aria-hidden="true" /> : null}
        </span>
        <span className="text-xs font-semibold tracking-wide text-[#666] uppercase">{label}</span>
      </div>
      <strong className="text-[clamp(22px,2.5vw,30px)] font-bold tracking-tight text-[#1a1a1a]">{value}</strong>
      {trend != null ? (
        <div className="flex items-center gap-2">
          <Badge className="rounded-none border-[#1a1a1a] bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-semibold text-white">
            {trend}%
          </Badge>
          <span className="text-xs text-[#888]">{note}</span>
        </div>
      ) : null}
    </section>
  )
}

export function AdminSectionTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-bold tracking-wide text-[#1a1a1a] uppercase', className)}>{children}</h3>
  )
}
