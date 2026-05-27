import { getServerSession } from 'next-auth'

import { getByVersionByCode } from '@apis/version'
import { getDictionary } from '@/utils/getDictionary'
import DashboardClient from '@/app/[lang]/[zoneId]/(dashboard)/(private)/dashboards/client/page';
import NotFoundPage from '@/app/[lang]/[...not-found]/page'
import Language from '@views/pages/auth/language'

const LanguagePage = async () => {
  // Execute all APIs in parallel
  const [session, data] = await Promise.all([
    getServerSession(),
    getByVersionByCode('0.1')
  ])

  // Start dictionary fetch immediately but don't await yet
  const dictionaryPromise = data ? getDictionary(data.language) : Promise.resolve(null)

  if (!data) {
    return <NotFoundPage params={{ lang: 'en' }} />
  }

  if (session) {
    return <DashboardClient params={{ lang: data.language }} />
  }

  // Await dictionary only when needed
  const dictionary = await dictionaryPromise

  
return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <Language lange={data.language} dictionary={dictionary} />
    </div>
  )
}

export default LanguagePage