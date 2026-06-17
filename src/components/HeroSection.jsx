import laptopImg from '../assets/laptop.png'
import watchImg from '../assets/watch.png'
import mobileImg from '../assets/mobile.png'
import './HeroSection.css'

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <article className="hero-main">
          <div className="hero-main-visual">
            <img
              src={laptopImg}
              alt="Premium convertible laptops for rent"
              className="hero-product-img hero-product-img--laptop"
            />
          </div>
          <div className="hero-main-content">
            <p className="hero-eyebrow">The Best</p>
            <h1>Convertible Laptops</h1>
            <p className="hero-subtitle">Super Sale Up to 30% Off All Laptop</p>
            <a href="#shop" className="hero-cta-btn">SHOP NOW</a>
          </div>
        </article>

        <aside className="hero-side">
          <article className="hero-side-card hero-side-card--blue">
            <div className="hero-side-visual">
              <img
                src={watchImg}
                alt="Apple smart watches for rent"
                className="hero-product-img hero-product-img--watch"
              />
            </div>
            <div className="hero-side-content hero-side-content--right">
              <span className="hero-side-eyebrow">New Apple</span>
              <h2>Smart Watch</h2>
              <span className="hero-side-line hero-side-line--blue" aria-hidden="true" />
              <p>Release Date &amp; Price</p>
              <a href="#shop" className="hero-side-link">SHOP NOW</a>
            </div>
          </article>

          <article className="hero-side-card hero-side-card--pink">
            <div className="hero-side-content hero-side-content--left">
              <span className="hero-side-eyebrow">Special Offer</span>
              <h2>On Mobile Phone</h2>
              <span className="hero-side-line hero-side-line--peach" aria-hidden="true" />
              <p>The Complete Mobile Store</p>
              <a href="#shop" className="hero-side-link">SHOP NOW</a>
            </div>
            <div className="hero-side-visual">
              <img
                src={mobileImg}
                alt="Mobile phones for rent"
                className="hero-product-img hero-product-img--mobile"
              />
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}

export default HeroSection
