import laptopModernImg from '../assets/processed/laptop-modern.png'
import laptopSilverImg from '../assets/processed/laptop-silver.png'
import laptopDarkImg from '../assets/processed/laptop-dark.png'
import laptopColorImg from '../assets/processed/laptop-color.png'
import desktopSetupImg from '../assets/processed/desktop-setup.png'
import printerImg from '../assets/hero-printer.png'
import projectorImg from '../assets/categories/projector.png'
import accessoriesImg from '../assets/categories/accessories.png'
import networkingImg from '../assets/categories/networking.png'
import mobileImg from '../assets/mobile.png'
import watchImg from '../assets/watch.png'

export const CATEGORIES = [
  { id: 'laptops', label: 'Laptops', icon: 'laptop', image: laptopModernImg },
  { id: 'desktops', label: 'Desktops', icon: 'desktop', image: desktopSetupImg },
  { id: 'mobiles', label: 'Mobile Phones', icon: 'mobile', image: mobileImg },
  { id: 'tablets', label: 'Tablets', icon: 'tablet', image: laptopDarkImg },
  { id: 'monitors', label: 'Monitors', icon: 'monitor', image: laptopSilverImg },
  { id: 'printers', label: 'Printers', icon: 'printer', image: printerImg },
  { id: 'projectors', label: 'Projectors', icon: 'projector', image: projectorImg },
  { id: 'wearables', label: 'Smart Watches', icon: 'wearable', image: watchImg },
  { id: 'cctv', label: 'CCTV & Cameras', icon: 'cctv', image: accessoriesImg },
  { id: 'accessories', label: 'Accessories', icon: 'accessories', image: accessoriesImg },
  { id: 'networking', label: 'Networking Devices', icon: 'networking', image: networkingImg },
  { id: 'servers', label: 'Servers', icon: 'server', image: laptopColorImg },
]
