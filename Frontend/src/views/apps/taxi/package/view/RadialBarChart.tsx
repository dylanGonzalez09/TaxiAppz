// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'

// Type Import
import type { CardStatsVerticalProps } from '@/types/pages/widgetTypes'

// Component Import
import CustomAvatar from '@core/components/mui/Avatar'

const CardStatsVertical = (props: CardStatsVerticalProps) => {
  // Props
  const {
    stats,
    title,
    subtitle,
    avatarIcon,
    avatarColor,
    avatarSize,
    avatarIconSize,
    avatarSkin,

  } = props

  return (
    <Card>
      <CardContent className='flex flex-col gap-y-3 items-start ' style={{ padding: '34px' }}>
        <CustomAvatar variant='rounded' skin={avatarSkin} size={avatarSize} color={avatarColor}>
          <i className={classnames(avatarIcon, `text-[${avatarIconSize}px]`)} />
        </CustomAvatar>
        <div className='flex flex-col gap-y-1'>
          <Typography variant='h5'>{title}</Typography>
          <Typography color='text.disabled'>{subtitle}</Typography>
          <Typography color='text.primary'>{stats}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
