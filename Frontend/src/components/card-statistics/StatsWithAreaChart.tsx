'use client'

// Next Imports

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { CardStatsWithAreaChartProps } from '@/types/pages/widgetTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports

const CardStatsWithAreaChart = (props: CardStatsWithAreaChartProps) => {
  // Props
  const {
    stats,
    title,
    avatarIcon,    avatarSize,
    avatarColor,
    avatarIconSize,
    avatarSkin
  } = props

  // Hook


  return (
    <Card>
      <CardContent className='flex flex-col gap-2 pb-3'>
        <CustomAvatar variant='rounded' skin={avatarSkin} color={avatarColor} size={avatarSize}>
          <i className={classnames(avatarIcon, `text-[${avatarIconSize}px]`)} />
        </CustomAvatar>
        <div>
          <Typography variant='h5'>{stats}</Typography>
          <Typography variant='body2'>{title}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatsWithAreaChart
