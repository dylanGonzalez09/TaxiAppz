/* eslint-disable @typescript-eslint/no-unused-vars */
// Type Imports
import type { Locale } from '@configs/i18n'

import AutoLogout from '@views/AutoLogout'

const NotFoundPage = ({ params }: { params: { lang: Locale } }) => {


  return (
          <AutoLogout />

    // <Providers direction={direction}>
    //   <BlankLayout systemMode={systemMode}>
    //     <NotFound mode={mode} />
    //   </BlankLayout>
    // </Providers>
  )
}

export default NotFoundPage
