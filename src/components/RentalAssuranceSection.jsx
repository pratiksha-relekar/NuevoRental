import { forwardRef, useRef } from 'react'
import {
  ArrowRight,
  ClipboardCheck,
  Headphones,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { AnimatedBeam } from './ui/animated-beam'
import { Card, CardHeader, CardTitle } from './ui/card'
import './RentalAssuranceSection.css'

const PROCESS_STEPS = [
  {
    id: 'order',
    phase: 'Order',
    title: 'Place order',
    icon: ShoppingBag,
    theme: 'blue',
  },
  {
    id: 'verify',
    phase: 'Verify',
    title: 'KYC & payment',
    icon: ClipboardCheck,
    theme: 'sky',
  },
  {
    id: 'deliver',
    phase: 'Deliver',
    title: 'Device prepared',
    icon: PackageCheck,
    theme: 'indigo',
  },
  {
    id: 'use',
    phase: 'Use',
    title: 'Doorstep setup',
    icon: Truck,
    theme: 'teal',
  },
  {
    id: 'return',
    phase: 'Return',
    title: 'Support & pickup',
    icon: RotateCcw,
    secondaryIcon: Headphones,
    theme: 'rose',
  },
]

function FlowArrow({ index }) {
  return (
    <div
      className="assurance-flow-arrow"
      style={{ '--arrow-delay': `${index * 0.2}s` }}
      aria-hidden="true"
    >
      <span className="assurance-flow-arrow-track">
        <span className="assurance-flow-arrow-beam" />
      </span>
      <span className="assurance-flow-arrow-head">
        <ArrowRight size={18} strokeWidth={2.5} />
      </span>
    </div>
  )
}

const StepCard = forwardRef(function StepCard({ step, index }, ref) {
  const Icon = step.icon
  const SecondaryIcon = step.secondaryIcon

  return (
    <article
      className={`assurance-step-card assurance-step-card--${step.theme}`}
      style={{ '--card-index': index }}
    >
      <Card className="assurance-step-card-inner">
        <div className="assurance-step-card-glow" aria-hidden="true" />

        <CardHeader className="assurance-step-card-header">
          <div className="assurance-step-card-meta">
            <span className="assurance-step-card-index">0{index + 1}</span>
            <span className="assurance-step-card-phase">{step.phase}</span>
          </div>

          <div className="assurance-step-card-icon-wrap" ref={ref}>
            <div className="assurance-step-card-icon">
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              {SecondaryIcon && (
                <span className="assurance-step-card-icon-badge" aria-hidden="true">
                  <SecondaryIcon size={11} strokeWidth={2} />
                </span>
              )}
            </div>
          </div>

          <CardTitle className="assurance-step-card-title">{step.title}</CardTitle>
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
    <section className="rental-assurance" aria-labelledby="rental-assurance-heading">
      <div className="rental-assurance-bg" aria-hidden="true" />

      <div className="rental-assurance-inner">
        <header className="rental-assurance-header">
          <span className="rental-assurance-eyebrow">How It Works</span>
          <h2 id="rental-assurance-heading" className="rental-assurance-title">
            Rent with Confidence — Simple &amp; Transparent
          </h2>
          <p className="rental-assurance-subtitle">
            Order → Verify → Deliver → Use → Return
          </p>
        </header>

        <div className="assurance-beam-container" ref={containerRef}>
          <div className="assurance-beam-track">
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.id} className="assurance-beam-item">
                <StepCard ref={stepRefs[index]} step={step} index={index} />
                {index < PROCESS_STEPS.length - 1 && <FlowArrow index={index} />}
              </div>
            ))}
          </div>

          <AnimatedBeam containerRef={containerRef} fromRef={step1Ref} toRef={step2Ref} duration={2.5} delay={0} />
          <AnimatedBeam containerRef={containerRef} fromRef={step2Ref} toRef={step3Ref} duration={2.5} delay={0.3} reverse />
          <AnimatedBeam containerRef={containerRef} fromRef={step3Ref} toRef={step4Ref} duration={2.5} delay={0.6} />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step4Ref}
            toRef={step5Ref}
            duration={2.5}
            delay={0.9}
            reverse
            gradientStartColor="#2b8fe8"
            gradientStopColor="#e2557a"
          />
        </div>
      </div>
    </section>
  )
}

export default RentalAssuranceSection
