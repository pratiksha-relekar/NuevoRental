import { forwardRef, useRef } from 'react'
import {
  ClipboardCheck,
  Headphones,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { AnimatedBeam } from './ui/animated-beam'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const PROCESS_STEPS = [
  {
    id: 'order',
    phase: 'Order',
    title: 'Place order',
    icon: ShoppingBag,
  },
  {
    id: 'verify',
    phase: 'Verify',
    title: 'KYC & payment',
    icon: ClipboardCheck,
  },
  {
    id: 'deliver',
    phase: 'Deliver',
    title: 'Device prepared',
    icon: PackageCheck,
  },
  {
    id: 'use',
    phase: 'Use',
    title: 'Doorstep setup',
    icon: Truck,
  },
  {
    id: 'return',
    phase: 'Return',
    title: 'Support & pickup',
    icon: RotateCcw,
    secondaryIcon: Headphones,
  },
]

const StepCard = forwardRef(function StepCard({ step, index }, ref) {
  const Icon = step.icon
  const SecondaryIcon = step.secondaryIcon

  return (
    <article className="relative min-w-0 flex-1">
      <Card className="h-full gap-0 rounded-none border border-[#e5e5e5] bg-white py-0 shadow-none ring-0 transition-colors hover:border-[#1a1a1a]">
        <CardHeader className="gap-4 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-wide text-[#aaa] uppercase">
              0{index + 1}
            </span>
            <Badge
              variant="outline"
              className="rounded-none border-[#d8d8d8] bg-[#fafafa] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#1a1a1a] uppercase"
            >
              {step.phase}
            </Badge>
          </div>

          <div className="flex justify-center py-2" ref={ref}>
            <div className="relative inline-flex size-14 items-center justify-center border border-[#1a1a1a] bg-[#1a1a1a] text-white">
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              {SecondaryIcon ? (
                <span
                  className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center border border-[#e5e5e5] bg-white text-[#1a1a1a]"
                  aria-hidden="true"
                >
                  <SecondaryIcon size={11} strokeWidth={2} />
                </span>
              ) : null}
            </div>
          </div>

          <CardTitle className="text-center text-sm font-bold text-[#1a1a1a]">{step.title}</CardTitle>
        </CardHeader>
      </Card>
    </article>
  )
})

function RentalAssuranceSection() {
  const containerRef = useRef(null)
  const step1Ref = useRef(null)
  const step2Ref = useRef(null)
  const step3Ref = useRef(null)
  const step4Ref = useRef(null)
  const step5Ref = useRef(null)
  const stepRefs = [step1Ref, step2Ref, step3Ref, step4Ref, step5Ref]

  return (
    <section className="border-y border-[#e5e5e5] bg-[#ececec] py-12 md:py-16" aria-labelledby="rental-assurance-heading">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <header className="mb-10 text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-none border-[#d8d8d8] bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#1a1a1a] uppercase"
          >
            How It Works
          </Badge>
          <h2
            id="rental-assurance-heading"
            className="text-[clamp(24px,3vw,34px)] font-bold tracking-tight text-[#1a1a1a]"
          >
            Rent with Confidence — Simple &amp; Transparent
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm tracking-wide text-[#666] uppercase">
            Order → Verify → Deliver → Use → Return
          </p>
        </header>

        <div className="relative" ref={containerRef}>
          <div
            className={cn(
              'grid grid-cols-1 gap-4',
              'sm:grid-cols-2 lg:grid-cols-5 lg:gap-3',
            )}
          >
            {PROCESS_STEPS.map((step, index) => (
              <StepCard key={step.id} ref={stepRefs[index]} step={step} index={index} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step1Ref}
              toRef={step2Ref}
              duration={2.5}
              delay={0}
              pathWidth={1.5}
              pathOpacity={0.25}
              gradientStartColor="#1a1a1a"
              gradientStopColor="#1a1a1a"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step2Ref}
              toRef={step3Ref}
              duration={2.5}
              delay={0.3}
              reverse
              pathWidth={1.5}
              pathOpacity={0.25}
              gradientStartColor="#1a1a1a"
              gradientStopColor="#1a1a1a"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step3Ref}
              toRef={step4Ref}
              duration={2.5}
              delay={0.6}
              pathWidth={1.5}
              pathOpacity={0.25}
              gradientStartColor="#1a1a1a"
              gradientStopColor="#1a1a1a"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step4Ref}
              toRef={step5Ref}
              duration={2.5}
              delay={0.9}
              reverse
              pathWidth={1.5}
              pathOpacity={0.25}
              gradientStartColor="#1a1a1a"
              gradientStopColor="#1a1a1a"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default RentalAssuranceSection
