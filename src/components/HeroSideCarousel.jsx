import { useCallback, useEffect, useState } from 'react'
import { HERO_CAROUSEL_SLIDES } from '../data/heroCarouselSlides'

function HeroSideCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = useCallback((index) => {
    if (index === activeIndex) return
    setIsAnimating(true)
    setActiveIndex(index)
    window.setTimeout(() => setIsAnimating(false), 400)
  }, [activeIndex])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsAnimating(true)
      setActiveIndex((current) => (current + 1) % HERO_CAROUSEL_SLIDES.length)
      window.setTimeout(() => setIsAnimating(false), 400)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [])

  const slide = HERO_CAROUSEL_SLIDES[activeIndex]

  return (
    <article className="hero-grid-card hero-side-carousel" aria-live="polite">
      <div className={`hero-carousel-content${isAnimating ? ' hero-carousel-content--fade' : ''}`}>
        <span className="hero-carousel-badge">{slide.badge}</span>
        <h2 className="hero-carousel-title">{slide.title}</h2>
        <div className="hero-carousel-pricing">
          <span className="hero-carousel-price">₹{slide.rentalPrice}</span>
          <span className="hero-carousel-original">INR {slide.originalPrice}</span>
          <span className="hero-carousel-period">/{slide.period}</span>
        </div>
        <p className="hero-carousel-desc">{slide.description}</p>
        <a href="#rental-products" className="hero-carousel-link">RENT NOW</a>
      </div>

      <div className="hero-carousel-visual">
        <div className="hero-carousel-glow" aria-hidden="true" />
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.imageAlt}
          className={`hero-carousel-img${isAnimating ? ' hero-carousel-img--fade' : ''}`}
        />
      </div>

      <div className="hero-carousel-dots" role="tablist" aria-label="Featured rental products">
        {HERO_CAROUSEL_SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`hero-carousel-dot${index === activeIndex ? ' hero-carousel-dot--active' : ''}`}
            aria-label={`Show ${item.title}`}
            aria-selected={index === activeIndex}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </article>
  )
}

export default HeroSideCarousel
