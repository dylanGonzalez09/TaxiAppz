// MUI Imports
import Grid from '@mui/material/Grid'

// Types Imports

// Component Imports
import CardStatsHorizontalWithAvatar from '@components/card-statistics/HorizontalWithAvatar'

const HorizontalStatisticsCard = ({ data }: { data?: any[] }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            {/* Render the CardStatsHorizontalWithAvatar for each item */}
            <CardStatsHorizontalWithAvatar {...item} avatarSkin="light" avatarIconSize={24} />
          </Grid>
        ))}
      </Grid>
    )
  );
};

export default HorizontalStatisticsCard;
