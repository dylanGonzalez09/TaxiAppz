'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Link from '@components/Link'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

const VerifyEmailV1 = (dictionary: any) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>{dictionary['navigation'].Verifyyouremail}</Typography>
            <Typography>
              {dictionary['navigation'].Accountactivationlinksenttoyouemailaddress}:{' '}
              <span className='font-medium text-textPrimary'>john.doe@email.com</span> {dictionary['navigation'].Pleasefollowthelinkinsidetocontinue}
            </Typography>
          </div>
          <Button fullWidth variant='contained' type='submit' className='mbe-6'>
            {dictionary['navigation'].SkipForNow}
          </Button>
          <div className='flex justify-center items-center flex-wrap gap-2'>
            <Typography>Didn&#39;t get the mail?</Typography>
            <Typography color='primary' component={Link}>
              {dictionary['navigation'].Resend}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default VerifyEmailV1
