'use client'

// Next Imports
import { useEffect,useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { MenuItem } from '@mui/material'

// React Imports

// Third-party Imports
import classnames from 'classnames'

import { useForm ,Controller} from 'react-hook-form';

// Type Imports
import axios from 'axios'

import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

import { useSettings } from '@core/hooks/useSettings'


import { getLocalizedUrl } from '@/utils/i18n'

import { ENDPOINTS } from '@apis/endpoint'

import { getCountries } from '@/app/api/apps/taxi/country';
import { validatePhoneNumber } from '@/utils/validation';

// Styled Custom Components
const DeleteAccountIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
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

interface FormData {
    country: string;
    phoneNumber: string;
    otp: string;
}

const defaultValues: FormData = {
    country: '',
    phoneNumber: '',
    otp: '',
}

const DeleteAccount = ({ mode }: { mode: SystemMode }) => {
  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'

  const { control, reset: resetForm,setValue,formState: { errors } } = useForm<FormData>({
      defaultValues,
      mode: 'all',
  });

  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
       
        try { 
          
          const countryData = await getCountries();
          
          setCountries(countryData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }, []);

    const handleCountryChange = (countryId: string) => {
        const country = countries.find(c => c.id === countryId);

        if (country) {
            setSelectedCountry(country.id);
            setValue('country',countryId);
        }
    };

    const handleReset = () => {
        resetForm();
        setPhoneNumber('');
        setOtp('');
    };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault()
    
    if(otp === '')
    {
        try 
        {       
            const response = await axios.post(ENDPOINTS.AccountDelete.sendOtp, {
                country: selectedCountry,
                phoneNumber: phoneNumber,
            });

            const result = response.data.data;

            if (result.status === 200) {
                setSnackbar({ open: true, message: result.msg, severity: 'success' })
                setOtpSent(true);
            } else {
                setSnackbar({ open: true, message: result.msg, severity: 'error' })
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'An error occurred. Please try again.', severity: 'error' })
        }
    }
    else
    {
        try 
        {       
            const response = await axios.post(ENDPOINTS.AccountDelete.remove, {
                country: selectedCountry,
                phoneNumber: phoneNumber,
                otp: otp
            });

            const result = response.data.data;

            if (result.status === 200) {
                setSnackbar({ open: true, message: result.msg, severity: 'success' });
                handleReset();
            } else {
                setSnackbar({ open: true, message: result.msg, severity: 'error' })
                setOtp('');
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'An error occurred. Please try again.', severity: 'error' })
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
        <DeleteAccountIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Account delete using Phone Number</Typography>
          </div>
          <form autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                <CustomTextField
                    select
                    fullWidth
                    label="Country"
                    {...field}
                    value={field.value}
                    onChange={e => {
                        field.onChange(e);
                        handleCountryChange(e.target.value);
                    }}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                >
                    {countries.map(country => (
                        <MenuItem key={country.id} value={country.id}>
                            {country.name} {country.dial_code}
                        </MenuItem>
                    ))}
                    
                </CustomTextField>
                )}
            />
            <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: 'Phone number is required',validate: validatePhoneNumber }}
                render={({ }) => (
                <CustomTextField
                fullWidth
                label='Phone Number'
                placeholder='Enter your phone number'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                />
                )}
            />
            <Button fullWidth variant='contained' type='submit'>
              Send OTP
            </Button>

            {otpSent && (
            <>
            <Controller
                name="otp"
                control={control}
                rules={{ required: 'OTP is required' }}
                render={({  }) => (
                <CustomTextField
                fullWidth
                label='OTP'
                placeholder='Enter OTP'
                value={otp}
                onChange={e => setOtp(e.target.value)}
                error={!!errors.otp}
                helperText={errors.otp?.message}
                />
                )}
            />
            <Button fullWidth variant='contained' type='submit'>
              Delete
            </Button>
            </>
            )}
          </form>
        </div>
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default DeleteAccount
