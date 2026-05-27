/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

import { useParams, useRouter } from 'next/navigation'

import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { fetchPromoExpiry } from '@/app/api/apps/taxi/promoCode'
import type { CustomAvatarProps } from '@core/components/mui/Avatar';
import CustomAvatar from '@core/components/mui/Avatar'
import themeConfig from '@configs/themeConfig'
import { useSettings } from '@core/hooks/useSettings'
import { getInitials } from '@/utils/getInitials'
import type { ThemeColor } from '@/@core/types'

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
} & (
    | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
    | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
    | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
  )

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationsType[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const notificationCount = notifications.filter(n => !n.read).length
  const readAll = notifications.every(n => n.read)

  const router = useRouter()
const { lang, zoneId } = useParams()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const promo = await fetchPromoExpiry()
     
      const mapped = promo.results.map((doc: {
        promoCode: string;
        toDate: string;
      }) => {
        const toDate = new Date(doc.toDate)
        const isExpired = toDate < new Date()

        return {
          title: `Promo Code ${isExpired ? 'Expired' : 'Active'}`,
          subtitle: `Promo Code: ${doc.promoCode}`,
          time: toDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }) + ' ' + toDate.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
          read: !isExpired
        }
      })
     
      setNotifications(mapped)
      setFetched(true)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setOpen(prev => !prev)
   
    if (!fetched) {
      await fetchNotifications()
    }
  }

const handleViewAllNotifications = () => {
  router.push(`/${lang}/${zoneId}/apps/taxi/notification/66d477418c8e995c9073c512`)
}

  const handleReadNotification = (e: any, value: boolean, index: number) => {
    e.stopPropagation()
    const updated = [...notifications]
   
    updated[index].read = value
    setNotifications(updated)
  }

  const handleRemoveNotification = (e: any, index: number) => {
    e.stopPropagation()
    const updated = [...notifications]
   
    updated.splice(index, 1)
    setNotifications(updated)
  }

  const readAllNotifications = () => {
    const updated = notifications.map(n => ({ ...n, read: !readAll }))
   
    setNotifications(updated)
  }

  // ... (adjustPopoverHeight stays the same)

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          variant='dot'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        transition
        anchorEl={anchorRef.current}
        disablePortal
        placement='bottom-end'
        ref={ref}
        className={classnames('z-[1] !mbs-3', {
          'is-full max-bs-[550px] bs-[550px]': isSmallScreen,
          'is-96 max-bs-[550px] bs-[550px]': !isSmallScreen
        })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: 'right top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between p-4 gap-2'>
                    <Typography variant='h6'>Notifications</Typography>
                    {notificationCount > 0 && (
                      <Chip size='small' color='primary' label={`${notificationCount} New`} />
                    )}
                    {notifications.length > 0 && (
                      <IconButton size='small' onClick={readAllNotifications}>
                        <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} />
                      </IconButton>
                    )}
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading ? (
                      <div className='text-center p-4'>Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className='text-center p-4 text-sm text-disabled'>No notifications</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={i}
                          className='flex items-start p-4 hover:bg-actionHover border-b cursor-pointer group'
                          onClick={e => handleReadNotification(e, true, i)}
                        >
                          {getAvatar(n)}
                          <div className='flex flex-col flex-grow px-3'>
                            <Typography variant='body2' fontWeight={500}>{n.title}</Typography>
                            <Typography variant='caption'>{n.subtitle}</Typography>
                            <Typography variant='caption' color='text.disabled'>{n.time}</Typography>
                          </div>
                          <div className='flex flex-col items-end gap-2'>
                            <Badge
                              variant='dot'
                              color={n.read ? 'secondary' : 'primary'}
                              onClick={e => handleReadNotification(e, !n.read, i)}
                              className='invisible group-hover:visible cursor-pointer'
                            />
                            <i
                              className='tabler-x text-xl invisible group-hover:visible cursor-pointer'
                              onClick={e => handleRemoveNotification(e, i)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                   <Button
  fullWidth
  variant='contained'
  size='small'
  onClick={handleViewAllNotifications}
>
  View All Notifications
</Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
