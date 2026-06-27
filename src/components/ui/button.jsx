import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-medium leading-tight whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        admin:
          "bg-[#1a1a1a] text-white hover:bg-[#333] focus-visible:border-[#1a1a1a] focus-visible:ring-[#1a1a1a]/15",
        adminOutline:
          "border-[#1a1a1a] bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus-visible:border-[#1a1a1a] focus-visible:ring-[#1a1a1a]/10",
        adminIcon:
          "border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus-visible:border-[#1a1a1a] focus-visible:ring-[#1a1a1a]/10",
        adminIconDanger:
          "border-[#f0d0d0] bg-white text-[#c0392b] hover:bg-[#c0392b] hover:text-white focus-visible:border-[#c0392b] focus-visible:ring-[#c0392b]/10",
      },
      size: {
        default:
          "h-auto min-h-0 gap-1 px-2.5 py-1.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        xs: "h-auto min-h-0 gap-0.5 px-1.5 py-0.5 text-[0.65rem] has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-auto min-h-0 gap-1 px-2 py-1 text-[0.7rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-auto min-h-0 gap-1.5 px-3 py-2 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        admin: "h-10 gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide uppercase",
        icon: "size-7 shrink-0 p-0",
        "icon-xs": "size-6 shrink-0 p-0 [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-7 shrink-0 p-0",
        "icon-lg": "size-8 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
