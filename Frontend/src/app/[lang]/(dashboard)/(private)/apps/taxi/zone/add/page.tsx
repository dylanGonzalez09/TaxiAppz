// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AddAction from '@views/apps/taxi/zone/add/AddAction'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'
import { fetchSettings } from '@/app/api/apps/taxi/setting'

const ZoneApp = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)
  const lang = params.lang

  const settings = await fetchSettings()
  const general = settings.find((item: any) => item._id === 'modules')
  const subscriptionDetails = general?.settings.find((s: any) => s.name === 'subScription')?.value || 'no'

  return (
    <Grid container>
      <Grid item xs={12}>
        <AddAction lang={lang} dictionary={dictionary} subscriptionDetails={subscriptionDetails} />
      </Grid>
    </Grid>
  )
}

export default ZoneApp

