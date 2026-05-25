'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

const RegisterV1 = (dictionary: any) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const { lang: locale } = useParams()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>{dictionary['navigation'].Adventurestartshere}</Typography>
            <Typography>{dictionary['navigation'].Makeyourappmanagementeasyandfun}</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-6'>
            <CustomTextField autoFocus fullWidth label={dictionary['navigation'].Username} placeholder={dictionary['navigation'].Enteryourusername} />
            <CustomTextField fullWidth label={dictionary['navigation'].Email} placeholder={dictionary['navigation'].Enteryouremail} />
            <CustomTextField
              fullWidth
              label={dictionary['navigation'].Password}
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <>
                  <span>{dictionary['navigation'].Iagreeto}</span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    {dictionary['navigation'].privacypolicyandterms}
                  </Link>
                </>
              }
            />
            <Button fullWidth variant='contained' type='submit'>
              {dictionary['navigation'].SignUp}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{dictionary['navigation'].Alreadyhaveanaccount}</Typography>
              <Typography
                component={Link}
                href={getLocalizedUrl('/pages/auth/login-v1', locale as Locale)}
                color='primary'
              >
                {dictionary['navigation'].dictionary['navigation'].Signininstead}
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>{dictionary['navigation'].or}</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-textPrimary' size='small'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-error' size='small'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default RegisterV1
