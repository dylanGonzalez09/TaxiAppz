// MUI Imports
import Grid from '@mui/material/Grid'

import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'

// Components Imports
import CardActionsTable from '@views/pages/widget-examples/actions/Table'
import CardActionCollapsible from '@views/pages/widget-examples/actions/Collapsible'
import CardActionRefreshContent from '@views/pages/widget-examples/actions/RefreshContent'
import CardActionRemoveCard from '@views/pages/widget-examples/actions/RemoveCard'
import CardActionAll from '@views/pages/widget-examples/actions/AllActions'

const Actions  = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CardActionsTable dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <CardActionCollapsible dictionary={dictionary} />
      </Grid>
      <Grid item xs={12} md={6}>
        <CardActionRefreshContent dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <CardActionRemoveCard dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <CardActionAll dictionary={dictionary}/>
      </Grid>
    </Grid>
  )
}

export default Actions
