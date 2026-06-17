import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedDealsSection from '../components/FeaturedDealsSection'
import CategorySection from '../components/CategorySection'
import RentalProducts from '../components/RentalProducts'
import PopularBrandsSection from '../components/PopularBrandsSection'
import PromoBanners from '../components/PromoBanners'

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const handleCategoryChange = (categoryId) => {
    setActiveCategory((prev) => (prev === categoryId ? 'all' : categoryId))
  }

  return (
    <>
      <HeroSection />
      <FeaturedDealsSection />
      <CategorySection
        activeCategory={activeCategory === 'all' ? null : activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <RentalProducts activeCategory={activeCategory} />
      <PopularBrandsSection />
      <PromoBanners />
    </>
  )
}

export default HomePage
