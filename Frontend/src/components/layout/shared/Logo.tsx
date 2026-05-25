import { useEffect, useState } from 'react'

import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { getLogoFromCache } from '@/configs/logoManager'

const Logo = () => {
  const { settings } = useSettings()
  const { isHovered } = useVerticalNav()
  const [icon, setIcon] = useState('/images/logo.png')
  const [feviIcon, setFeviIcon] = useState('/images/favicon.webp')
  const { layout } = settings

  useEffect(() => {
    
    const cached = getLogoFromCache()
    
    if (cached) {
      if (cached.logo) setIcon(cached.logo)
      if (cached.feviIcon) setFeviIcon(cached.feviIcon)
    }
  }, [])

  return (
    <div className='flex items-center'>
      {isHovered ? (
        <img src={icon} alt='Hovered Logo' width='90%' height='auto' />
      ) : layout === 'collapsed' ? (
        <img src={feviIcon} alt='Taxi Logo' width='100%' height='auto' />
      ) : (
        <img src={icon} alt='Taxi Logo' width='90%' height='auto' />
      )}
    </div>
  )
}

export default Logo
