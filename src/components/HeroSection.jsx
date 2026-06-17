import { useMemo } from 'react'
import laptopImg from '../assets/laptop.png'
import desktopImg from '../assets/processed/desktop-setup.png'
import Hyperspeed from './Hyperspeed'
import HeroCarouselCard from './HeroCarouselCard'
import { HERO_HYPERSPEED_OPTIONS } from '../constants/hyperspeedOptions'
import './HeroSection.css'

function HeroSection() {
  const hyperspeedOptions = useMemo(() => HERO_HYPERSPEED_OPTIONS, [])

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <article className="hero-grid-card hero-main">
          <div className="hero-main-visual">
            <div className="hero-hyperspeed-wrap" aria-hidden="true">
              <Hyperspeed effectOptions={hyperspeedOptions} />
            </div>
            <div className="hero-visual-fade" aria-hidden="true" />
            <img
              src={laptopImg}
              alt="Premium laptops available for rent"
              className="hero-product-img hero-product-img--laptop"
            />
          </div>
          <div className="hero-main-content">
            <span className="hero-main-tag">IT Equipment Rental</span>
            <p className="hero-eyebrow">Rent the Best</p>
            <h1>Premium Laptops</h1>
            <p className="hero-subtitle">Daily, Monthly &amp; Long-Term Plans — Doorstep Delivery</p>
            <a href="#rental-products" className="hero-cta-btn hero-cta-btn--dark">RENT NOW</a>
          </div>
        </article>

        <aside className="hero-side">
          <article className="hero-grid-card hero-side-card hero-side-card--blue">
            <div className="hero-side-visual">
              <div className="hero-side-img-frame">
                <img
                  src={desktopImg}
                  alt="Desktops and workstations for rent"
                  className="hero-product-img hero-product-img--side"
                />
              </div>
            </div>
            <div className="hero-side-content hero-side-content--right">
              <span className="hero-side-eyebrow">Corporate Ready</span>
              <h2>Desktops on Rent</h2>
              <span className="hero-side-line hero-side-line--blue" aria-hidden="true" />
              <p>iMac, Tower PCs &amp; Tiny PCs for Teams</p>
              <a href="#rental-products" className="hero-side-link">RENT NOW</a>
            </div>
          </article>

          <HeroCarouselCard />
        </aside>
      </div>
    </section>
  )
}

export default HeroSection
