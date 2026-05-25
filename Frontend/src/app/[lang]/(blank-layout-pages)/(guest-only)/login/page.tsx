// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getByVersionByCode } from '@/app/api/apps/taxi/version'
import NotFoundPage from '@/app/[lang]/[...not-found]/page'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async () => {

  const data = await getByVersionByCode('0.1')

  if (!data || !data.language) {
    return <NotFoundPage params={{ lang: 'en' }} />; // Use a default language if `data` is invalid.
  }
  

  // Vars
  const mode = getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
