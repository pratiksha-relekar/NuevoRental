import { useState } from 'react'
import TopBar from './components/TopBar'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import CategorySection from './components/CategorySection'
import RentalProducts from './components/RentalProducts'
import './App.css'

function App() {
  const [activeCategory, setActiveCategory] = useState('all')

  const handleCategoryChange = (categoryId) => {
    setActiveCategory((prev) => (prev === categoryId ? 'all' : categoryId))
  }

  return (
    <div className="app">
      <TopBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection
          activeCategory={activeCategory === 'all' ? null : activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <RentalProducts activeCategory={activeCategory} />
      </main>
    </div>
  )
}

export default App
