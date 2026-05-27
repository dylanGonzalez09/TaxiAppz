'use client'

import { useState, useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Chip from '@mui/material/Chip'
import classnames from 'classnames'

import CustomAvatar from '@core/components/mui/Avatar'

// Lazy-load recharts to reduce initial bundle (chart only when dashboard visible)
const BarChartDynamic = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod

      function Chart({ data, selectedDay, onBarClick }) {
        return (
          <ResponsiveContainer width="100%" height={174}>
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} onClick={onBarClick}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={(props) => {
                  const { x, y, payload } = props
                  const day = payload.value
                  const dayData = data.find((d) => d.day === day)
                  const fill = dayData?.isFutureDay ? 'var(--mui-palette-text-secondary)' : 'var(--mui-palette-text-disabled)'


return (
                    <text x={x} y={y + 10} textAnchor="middle" fill={fill} fontSize={13}>{day}</text>
                  )
                }}
              />
              <YAxis hide />
              <Tooltip content={<></>} />
              <Bar
                dataKey="earnings"
                fill={(entry) => {
                  if (entry.isFutureDay) return 'transparent'
                  if (entry.day === selectedDay) return '#000000'

return 'var(--mui-palette-primary-lightOpacity)'
                }}
                radius={4}
                barSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      }


return Chart
    }),
  { ssr: false, loading: () => <div style={{ height: 174, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div> }
)

// Data for both weeks
const weekData = {
  thisWeek: {
    totalEarnings: '$468',
    dailyEarnings: {
      Mo: { total: 37, cash: 20, card: 12, wallet: 5 },
      Tu: { total: 76, cash: 40, card: 25, wallet: 11 },
      We: { total: 65, cash: 35, card: 20, wallet: 10 },
      Th: { total: 41, cash: 22, card: 12, wallet: 7 },
      Fr: { total: 99, cash: 50, card: 30, wallet: 19 },
      Sa: { total: 53, cash: 28, card: 15, wallet: 10 },
      Su: { total: 70, cash: 38, card: 20, wallet: 12 },
    },
    data: [
      {
        title: 'Cash',
        stats: '$545.69',
        avatarColor: 'primary',
        avatarIcon: 'tabler-currency-dollar',
      },
      {
        title: 'Card',
        stats: '$256.34',
        avatarColor: 'info',
        avatarIcon: 'tabler-chart-pie-2',
      },
      {
        title: 'Wallet',
        stats: '$74.19',
        avatarColor: 'error',
        avatarIcon: 'tabler-brand-paypal',
      },
    ],
  },
  lastWeek: {
    totalEarnings: '$355',
    dailyEarnings: {
      Mo: { total: 40, cash: 22, card: 12, wallet: 6 },
      Tu: { total: 60, cash: 32, card: 18, wallet: 10 },
      We: { total: 50, cash: 28, card: 15, wallet: 7 },
      Th: { total: 55, cash: 30, card: 16, wallet: 9 },
      Fr: { total: 85, cash: 45, card: 25, wallet: 15 },
      Sa: { total: 30, cash: 16, card: 8, wallet: 6 },
      Su: { total: 55, cash: 30, card: 15, wallet: 10 },
    },
    data: [
      {
        title: 'Cash',
        stats: '$365.79',
        avatarColor: 'primary',
        avatarIcon: 'tabler-currency-dollar',
      },
      {
        title: 'Card',
        stats: '$100.34',
        avatarColor: 'info',
        avatarIcon: 'tabler-chart-pie-2',
      },
      {
        title: 'Wallet',
        stats: '$90.99',
        avatarColor: 'error',
        avatarIcon: 'tabler-brand-paypal',
      },
    ],
  },
}

const daysOrder = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const EarningReports = () => {
  const [selectedWeek, setSelectedWeek] = useState('thisWeek')
  const [selectedDay, setSelectedDay] = useState(null)
  const [currentDay, setCurrentDay] = useState('')

  // Set current day on mount

  useEffect(() => {

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    setCurrentDay(days[new Date().getDay()])
  }, [])

  const currentData = weekData[selectedWeek]

  // Format data for chart (memoized to avoid new ref every render)
  const chartData = useMemo(() => Object.entries(currentData.dailyEarnings).map(([day, earnings]) => {
    const dayIndex = daysOrder.indexOf(day)
    const currentDayIndex = daysOrder.indexOf(currentDay)
    const isFutureDay = selectedWeek === 'thisWeek' && dayIndex > currentDayIndex

    return {
      day,
      earnings: isFutureDay ? 0 : earnings.total,
      isFutureDay
    }
  }), [currentData.dailyEarnings, currentDay, selectedWeek])

  // Get earnings for display
  const displayEarnings = selectedDay
    ? `$${currentData.dailyEarnings[selectedDay].total}`
    : currentData.totalEarnings

  // Get breakdown data
  const breakdownData = selectedDay
    ? [
        {
          title: 'Cash',
          stats: `$${currentData.dailyEarnings[selectedDay].cash}`,
          avatarColor: 'primary',
          avatarIcon: 'tabler-currency-dollar',
        },
        {
          title: 'Card',
          stats: `$${currentData.dailyEarnings[selectedDay].card}`,
          avatarColor: 'info',
          avatarIcon: 'tabler-chart-pie-2',
        },
        {
          title: 'Wallet',
          stats: `$${currentData.dailyEarnings[selectedDay].wallet}`,
          avatarColor: 'error',
          avatarIcon: 'tabler-brand-paypal',
        },
      ]
    : currentData.data

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedDay = data.activePayload[0].payload.day

      // Don't select future days
      if (data.activePayload[0].payload.isFutureDay) return

      setSelectedDay(clickedDay)
    }
  }

  const handleWeekChange = (event, newValue) => {
    setSelectedWeek(newValue)
    setSelectedDay(null)
  }

  const clearSelectedDay = () => {
    setSelectedDay(null)
  }

  return (
    <Card>
      <CardHeader
        title={`${selectedWeek === 'thisWeek' ? 'This' : 'Last'} Week Earnings`}
        className='pbe-0'
        action={
          selectedDay && (
            <Chip
              label={`${selectedDay}'s Earnings`}
              color='primary'
              size='small'
              onDelete={clearSelectedDay}
              deleteIcon={<i className="tabler-x" />}
              style={{ marginTop: '-4px' }}
            />
          )
        }
      />
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-8'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-2'>
              <Typography variant='h2'>{displayEarnings}</Typography>
            </div>
          </div>

          <Tabs
            value={selectedWeek}
            onChange={handleWeekChange}
            indicatorColor="primary"
            textColor="primary"
            aria-label="week switch"
          >
            <Tab label="This Week" value="thisWeek" />
            <Tab label="Last Week" value="lastWeek" />
          </Tabs>
        </div>

        <BarChartDynamic data={chartData} selectedDay={selectedDay} onBarClick={handleBarClick} />

        <div className='flex flex-col sm:flex-row gap-5 p-2 border rounded' style={{ height: '120px' }}>
          {breakdownData.map((item, index) => (
            <div key={index} className='flex flex-col gap-2 mt-2 mb-2 is-full '>
              <div className='flex items-center gap-2'>
                <CustomAvatar skin='light' variant='rounded' color={item.avatarColor} size={26}>
                  <i className={classnames(item.avatarIcon, 'text-lg')} />
                </CustomAvatar>
                <Typography variant='h6' className='leading-6 font-normal'>
                  {item.title}
                </Typography>
              </div>
              <Typography variant='h4'>{item.stats}</Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default EarningReports
