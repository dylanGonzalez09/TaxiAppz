// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import CardStatsHorizontalWithAvatar from '@components/card-statistics/HorizontalWithAvatar'

type ItemType = {
  title: string;
  subtitle?: string;
};


const HorizontalStatisticsCard = ({ data }: { data?: ItemType[] }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item: ItemType, index: number) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <CardStatsHorizontalWithAvatar stats={''} avatarIcon={''} {...item} avatarSkin='light' avatarIconSize={24} />
          </Grid>
        ))}
      </Grid>
    )
  )
}

export default HorizontalStatisticsCard
