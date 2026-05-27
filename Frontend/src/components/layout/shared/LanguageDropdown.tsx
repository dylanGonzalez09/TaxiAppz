'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

// API Import
import { fetchActiveLanguage } from '@apis/language'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

type LanguageDataType = {
  langCode: Locale
  langName: string
}

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')
  
  segments[1] = locale
  
  return segments.join('/')
}

const LanguageDropdown = () => {
  const [open, setOpen] = useState(false)
  const [languageData, setLanguageData] = useState<LanguageDataType[]>([])
  const [fetched, setFetched] = useState(false)

  const anchorRef = useRef<HTMLButtonElement>(null)

  const pathName = usePathname()
  const { settings } = useSettings()
  const { lang } = useParams()

  const fetchLanguages = async () => {
    
    try {
      const activeLe = await fetchActiveLanguage()
      
      const mappedLanguages = activeLe
        .filter((lang: any) => lang.status)
        .map((lang: any) => ({
          langCode: lang.code,
          langName: lang.name
        }))
      
        setLanguageData(mappedLanguages)
      setFetched(true)
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    }
  }

  const handleClose = () => setOpen(false)

  const handleToggle = async () => {
    setOpen(prev => !prev)
   
    if (!fetched) {
      await fetchLanguages()
    }
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <i className='tabler-language' />
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {languageData.map(locale => (
                    <MenuItem
                      key={locale.langCode}
                      component={Link}
                      href={getLocalePath(pathName, locale.langCode)}
                      onClick={handleClose}
                      selected={lang === locale.langCode}
                    >
                      {locale.langName}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LanguageDropdown
