import laptopSilverImg from '../assets/processed/laptop-silver.png'
import desktopSetupImg from '../assets/processed/desktop-setup.png'
import printerImg from '../assets/categories/printer.png'
import projectorImg from '../assets/categories/projector.png'
import watchImg from '../assets/watch.png'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
function PromoBanners() {
  return (
    <section className="promo-banners" aria-label="Rental promotions">
      <div className="promo-banners-inner">
        <article className="promo-banner promo-banner--deals">
          <div className="promo-banner-content">
            <h2 className="promo-banner-title">
              Mega Rental Deals
              <span className="promo-banner-title-sub">Save Up to 40% vs Buying</span>
            </h2>
            <p className="promo-banner-text">
              IT Equipment on Rent
              <span className="promo-banner-divider">/</span>
              Perfect for Offices &amp; Startups
            </p>
            <a href="#rental-products" className={cn(buttonVariants({ variant: 'default' }), 'promo-banner-btn')}>RENT NOW</a>
          </div>

          <div className="promo-banner-visual promo-banner-visual--cluster" aria-hidden="true">
            <img src={desktopSetupImg} alt="" className="promo-product promo-product--desktop" />
            <img src={laptopSilverImg} alt="" className="promo-product promo-product--laptop" />
            <img src={printerImg} alt="" className="promo-product promo-product--printer" />
            <img src={projectorImg} alt="" className="promo-product promo-product--projector" />
          </div>
        </article>

        <article className="promo-banner promo-banner--premium">
          <div className="promo-banner-decor" aria-hidden="true">
            <span className="promo-decor-ring promo-decor-ring--lg" />
            <span className="promo-decor-ring promo-decor-ring--sm" />
            <span className="promo-decor-dot promo-decor-dot--1" />
            <span className="promo-decor-dot promo-decor-dot--2" />
            <span className="promo-decor-dot promo-decor-dot--3" />
          </div>

          <div className="promo-banner-content">
            <h2 className="promo-banner-title">
              Rent Smart
              <span className="promo-banner-title-sub">Work Without Limits</span>
            </h2>
            <p className="promo-banner-text promo-banner-text--accent">
              Flexible Plans
              <span className="promo-banner-divider">|</span>
              Daily, Monthly &amp; Long-Term
            </p>
            <a href="#rental-products" className={cn(buttonVariants({ variant: 'default' }), 'promo-banner-btn promo-banner-btn--accent')}>RENT NOW</a>
          </div>

          <div className="promo-banner-visual promo-banner-visual--hero" aria-hidden="true">
            <img src={watchImg} alt="" className="promo-product promo-product--watch" />
          </div>
        </article>
      </div>
    </section>
  )
}

export default PromoBanners
