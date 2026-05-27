'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports

import Link from 'next/link'

import { useParams, useRouter } from 'next/navigation'


// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// import Alert from '@mui/material/Alert'

import { toast } from 'react-toastify';



// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

import { usePrivilegeStore } from '@/store/privilegeStore';

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@/configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { fetchUserByEmail } from '@/app/api/apps/taxi/user'

import { getByLanguageId } from '@/app/api/apps/taxi/language'
import { primaryZoneMenuList } from '@/app/api/apps/taxi/zone'  // make sure you import your zones API here

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  const [loading, setLoading] = useState(false) // Track loading state

  const submitLockRef = useRef(false)

  // Vars

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration ='/images/illustrations/characters/7.png'
  const lightIllustration = '/images/illustrations/characters/7.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()

  // const searchParams = useSearchParams()

  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const fetchPrivilege = usePrivilegeStore((s) => s.fetchPrivilege);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // defaultValues: {
  //   email: 'admin@nplus.com',
  //   password: 'admin@123'
  // }
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)


const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
  if (submitLockRef.current) return
  submitLockRef.current = true
  setLoading(true)
  let shouldUnlock = true

  try {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && !res.error) {
      const userData = await fetchUserByEmail({ email: data.email })

      if (!userData) throw new Error('Login succeeded, but failed to load user profile.')

      try {
        await fetchPrivilege()
      }

      catch (err) {
        console.error('Privilege fetch failed:', err)
      }


      localStorage.setItem('isDemoUser', userData?.roles === 'Demo' ? 'true' : 'false')
      if (userData?.roles) localStorage.setItem('userRole', userData.roles)
      let language = 'en'

      if (userData?.language) {
        const languageData = await getByLanguageId(userData.language)

        if (languageData?.code) language = languageData.code
      }


      const zones = await primaryZoneMenuList()
      const defaultZoneId = Array.isArray(zones) && zones.length > 0 ? zones[0]?._id || '' : ''

      if (!defaultZoneId) {
        throw new Error('No zones available for this account. Please create/assign a zone and try again.')
      }

      localStorage.setItem('defaultZoneId', defaultZoneId)

      // const redirectURL = searchParams.get('redirectTo') ?? '/'

      const finalRedirect = `/${language}/${defaultZoneId}/dashboards/client`

      shouldUnlock = false

      router.replace(getLocalizedUrl(finalRedirect, language))

      return
    }

    let errorMessage = 'Login failed. Please try again.'

    if (res?.error) {

      try {
        const errStr = typeof res.error === 'string' ? res.error : String(res.error)
        const trimmed = errStr.trim()

        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')))
          {
          const parsedError = JSON.parse(trimmed)

          errorMessage = Array.isArray(parsedError?.message) ? parsedError.message[0] : parsedError?.message || parsedError?.error || errStr
        }

        else {
          errorMessage = errStr
        }
      }

      catch {
        errorMessage = 'An unexpected error occurred. Please try again.'
      }
    }

    toast.error(errorMessage)
    setErrorState({ message: [errorMessage] })
  }

  catch (err: any)
   {
    const msg = err?.message || 'An unexpected error occurred. Please try again.'

    toast.error(msg)

    setErrorState({ message: [msg] })

  }

   finally {
    if (shouldUnlock) {
      setLoading(false)
      submitLockRef.current = false
    }
  }
}


  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
    <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'style={{ width: '15%' }}>
                <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          {/* <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
            <Typography variant='body2' color='primary'>
              Email: <span className='font-medium'>admin@nplus.com</span> / Pass:{' '}
              <span className='font-medium'>admin@123</span>
            </Typography>
          </Alert> */}
          <form
            noValidate
            autoComplete='off'
            action={() => {}}
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  type='email'
                  label='Email'
                  placeholder='Enter your email'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}

                  {...((errors.email || errorState !== null) && {
                    error: true,
                    helperText: errors?.email?.message || errorState?.message[0]
                  })}

                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Password'
                  placeholder='············'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
              <Typography
                className='text-end'
                color='primary'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale as Locale)}
              >
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

