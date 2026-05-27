// Next Imports
import type { Metadata } from 'next'

// import type { Locale } from '@/configs/i18n'

// Component Imports
import ResetPasswordV2 from '@views/pages/auth/ResetPasswordV2'

// Server Action Imports
// import { getServerMode } from '@core/utils/serverHelpers'
// import { getDictionary } from '@/utils/getDictionary'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset Your Password'
}

const ResetPasswordPage = async () => {
  // Vars
 

  return <ResetPasswordV2 />
}

export default ResetPasswordPage
