/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useCallback, useState, useMemo } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import themeConfig from '@/configs/themeConfig'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import type { Locale } from '@/configs/i18n'

type Language = {
  name: string
  code: string
  id: string
}

type SelectLanguageProps = {
  lange: Language[]
  dictionary: any
}

const SelectLanguage = ({ lange, dictionary }: SelectLanguageProps) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [selectedLanguage, setSelectedLanguage] = useState('')

  // Memoize language options to prevent unnecessary re-renders
  const languageOptions = useMemo(() => (
    lange.map((language) => (
      <MenuItem key={language.id} value={language.code}>
        {language.name}
      </MenuItem>
    ))
  ), [lange])

  // Optimize form submission with useCallback
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLanguage) return
    
    const loginUrl = `/${selectedLanguage}/login`

    router.push(loginUrl)
  }, [selectedLanguage, router])

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link 
            href={getLocalizedUrl('/', locale as Locale)} 
            className='flex justify-center mbe-6'
            prefetch={false} // Disable prefetch for logo link
          >
            <Logo />
          </Link>
          
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4' component='h1'>
              {dictionary.navigation.SelectLanguage}
            </Typography>
            <Typography component='p'>
              Enter your language and we&#39;ll send you instructions to reset your language
            </Typography>
          </div>
          
          <form 
            noValidate 
            autoComplete='off' 
            onSubmit={handleSubmit} 
            className='flex flex-col gap-6'
          >
            <CustomTextField
              select
              fullWidth
              label={dictionary.navigation.Language}
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languageOptions}
            </CustomTextField>
            
            <Button 
              fullWidth 
              variant='contained' 
              type='submit'
              disabled={!selectedLanguage} // Disable when no language selected
            >
              {dictionary.navigation.Submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default SelectLanguage