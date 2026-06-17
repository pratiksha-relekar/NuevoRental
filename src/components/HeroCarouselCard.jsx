import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HERO_CAROUSEL_SLIDES } from '../constants/heroCarouselSlides'
import './HeroCarouselCard.css'

const AUTO_PLAY_MS = 1800

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function HeroCarouselCard() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback((index) => {
    setActiveIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return undefined

    const timer = window.setInterval(goNext, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [goNext, isPaused])

  const slide = HERO_CAROUSEL_SLIDES[activeIndex]

  return (
    <article
      className="hero-grid-card hero-side-card hero-side-card--pink hero-carousel-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Office essentials rental offers"
    >
      <div className="hero-carousel-body" key={slide.id}>
        <div className="hero-carousel-copy">
          <span className="hero-carousel-badge">{slide.badge}</span>
          <h2 className="hero-carousel-title">{slide.title}</h2>
          <div className="hero-carousel-pricing">
            <span className="hero-carousel-price">
              {formatPrice(slide.rentalPrice)}
              <span className="hero-carousel-period">/{slide.period}</span>
            </span>
            <span className="hero-carousel-original">
              {formatPrice(slide.originalPrice)}
            </span>
          </div>
          <p className="hero-carousel-desc">{slide.description}</p>
          <Link to="/rent-products" className="hero-carousel-link">RENT NOW</Link>
        </div>

        <div className="hero-carousel-visual">
          <div className="hero-side-img-frame hero-side-img-frame--printer">
            <img
              src={slide.image}
              alt={slide.alt}
              className="hero-product-img hero-product-img--side"
            />
          </div>
        </div>
      </div>

      <div className="hero-carousel-dots" role="tablist" aria-label="Carousel slides">
        {HERO_CAROUSEL_SLIDES.map((item, index) => {
          const isActive = index === activeIndex

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={`hero-carousel-dot${isActive ? ' hero-carousel-dot--active' : ''}`}
              aria-label={`Show ${item.title}`}
              aria-selected={isActive}
              onClick={() => goToSlide(index)}
            />
          )
        })}
      </div>
    </article>
  )
}

export default HeroCarouselCard
