import { laptopAsus } from '../assets/laptop'
import laptopDarkImg from '../assets/processed/laptop-dark.png'
import laptopSilverImg from '../assets/processed/laptop-silver.png'
import laptopColorImg from '../assets/processed/laptop-color.png'
import { desktopDellVostro1 } from '../assets/Desktop'
import { printerLaserjetWhite } from '../assets/printer'
import { projectorBenq } from '../assets/projector'
import { tvThomsonSmart } from '../assets/TV'
import accessoriesImg from '../assets/categories/accessories.png'
import networkingImg from '../assets/categories/networking.png'
import { mobileIphoneColors } from '../assets/mobile'
import { watchAppleInfograph } from '../assets/watches'

export const CATEGORIES = [
  { id: 'laptops', label: 'Laptops', icon: 'laptop', image: laptopAsus },
  { id: 'desktops', label: 'Desktops', icon: 'desktop', image: desktopDellVostro1 },
  { id: 'mobiles', label: 'Mobile Phones', icon: 'mobile', image: mobileIphoneColors },
  { id: 'tablets', label: 'Tablets', icon: 'tablet', image: laptopDarkImg },
  { id: 'monitors', label: 'Monitors', icon: 'monitor', image: laptopSilverImg },
  { id: 'tvs', label: 'TVs', icon: 'monitor', image: tvThomsonSmart },
  { id: 'printers', label: 'Printers', icon: 'printer', image: printerLaserjetWhite },
  { id: 'projectors', label: 'Projectors', icon: 'projector', image: projectorBenq },
  { id: 'wearables', label: 'Smart Watches', icon: 'wearable', image: watchAppleInfograph },
  { id: 'cctv', label: 'CCTV & Cameras', icon: 'cctv', image: accessoriesImg },
  { id: 'accessories', label: 'Accessories', icon: 'accessories', image: accessoriesImg },
  { id: 'networking', label: 'Networking Devices', icon: 'networking', image: networkingImg },
  { id: 'servers', label: 'Servers', icon: 'server', image: laptopColorImg },
]
