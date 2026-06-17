import { RENTAL_BRANDS } from '../data/brands'
import BrandMark from './BrandMark'
import './PopularBrandsSection.css'

function BrandItem({ brand }) {
  return (
    <div className="popular-brands-item" title={brand.name}>
      <BrandMark brand={brand} />
    </div>
  )
}

function PopularBrandsSection() {
  const marqueeBrands = [...RENTAL_BRANDS, ...RENTAL_BRANDS]

  return (
    <section className="popular-brands" aria-labelledby="popular-brands-heading">
      <div className="popular-brands-inner">
        <header className="popular-brands-header">
          <h2 id="popular-brands-heading" className="popular-brands-title">
            The Best Brands All in One Place
          </h2>
          <p className="popular-brands-subtitle">
            Premium laptops, desktops, monitors &amp; IT gear from world-leading manufacturers
          </p>
        </header>

        <div className="popular-brands-marquee" aria-hidden="true">
          <div className="popular-brands-fade popular-brands-fade--left" />
          <div className="popular-brands-fade popular-brands-fade--right" />

          <div className="popular-brands-track">
            {marqueeBrands.map((brand, index) => (
              <BrandItem key={`${brand.id}-${index}`} brand={brand} />
            ))}
          </div>
        </div>

        <ul className="popular-brands-sr-list">
          {RENTAL_BRANDS.map((brand) => (
            <li key={brand.id}>{brand.name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default PopularBrandsSection
