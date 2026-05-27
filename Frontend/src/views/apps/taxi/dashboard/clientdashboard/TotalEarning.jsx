'use client'

import { useState } from 'react'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { useIsDemoUser } from '@/utils/demoUser'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))


const RevenueReport = ({ revenue, dictionary }) => {
  const { checkDemoStatus } = useIsDemoUser()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const yearOptions = [currentYear, currentYear - 1] // Includes current year
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedYear, setSelectedYear] = useState(currentYear) // Default to current year

  const normalizeToMonths = (data) => {
  const result = Array(12).fill(0)

  data.forEach((val, index) => {
    result[index] = val
  })

  return result
}

  // Format currency based on demo status
  const formatCurrency = (value) => {
    const currencySymbol = checkDemoStatus()
      ? '$'
      : revenue?.[selectedYear]?.payments?.currencySymbol || '$'
    
      return `${currencySymbol} ${(value ?? 0).toFixed(2)}`
  
  }
  
  const yearlyData = yearOptions.reduce((acc, year) => {
    
    const values = revenue?.[year] || {}

    acc[year] = {
        payments: values?.payments || { 
          total: 0, 
          cash: 0, 
          card: 0, 
          wallet: 0,
          currencySymbol: values?.payments?.currencySymbol || '$'
        },
        completed: Array.isArray(values?.completed) ? values.completed : Array(12).fill(0),
        cancelled: Array.isArray(values?.cancelled) ? values.cancelled : Array(12).fill(0),
        lastMonth: Array.isArray(values?.lastMonth) ? values.lastMonth : [],

        // thisMonth: Array.isArray(values?.thisMonth) ? values.thisMonth.map((entry) => entry.count || 0) : []
        
       thisMonth: normalizeToMonths(values?.thisMonth || [])

    }

    return acc
  }, {  
      [new Date().getFullYear() - 1]: {
          payments: { 
            total: 0, 
            cash: 0, 
            card: 0, 
            wallet: 0,
            currencySymbol: '$'
          },
          completed: Array(12).fill(0),
          cancelled: Array(12).fill(0),
          lastMonth: [],
          thisMonth: []
      }
  })

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  
  const handleYearChange = (year) => {
    setSelectedYear(year)
    handleClose()
  }

  const theme = useTheme()
  const disabledText = 'var(--mui-palette-text-disabled)'

  // Get data for selected year
  const yearData = yearlyData[selectedYear] || yearlyData[currentYear]
  const { payments, completed, cancelled, lastMonth, thisMonth } = yearData

  // Filter data for current year (last 3 months)
  const getFilteredData = (data) => {
    return selectedYear === currentYear ? 
      data.slice(Math.max(0, currentMonth - 2), currentMonth + 1) : 
      data
  }


  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const getMonthLabelsForYear = () => {
    return selectedYear === currentYear ?
      monthLabels.slice(Math.max(0, currentMonth - 2), currentMonth + 1) :
      monthLabels
  }

  // Chart series
  const barSeries = [
    { name: dictionary['navigation'].Completed, data: getFilteredData(completed) },
    { name: dictionary['navigation'].Cancelled, data: getFilteredData(cancelled) }
  ]

  const lineSeries = [
    { name: 'Last Month', data: getFilteredData(lastMonth) },
    { name: 'This Month', data: getFilteredData(thisMonth) }
  ]
  

  // Chart options
  const barOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      colors: ['var(--mui-palette-background-paper)']
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-warning-main)'],
    legend: {
      offsetY: -4,
      offsetX: -35,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      itemMargin: {
        horizontal: 9
      },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 7,
        columnWidth: '40%',
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all'
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      yaxis: {
        lines: { show: false }
      },
      padding: {
        left: -6,
        right: -11,
        bottom: -11
      }
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
      categories: getMonthLabelsForYear(),
      labels: {
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize 
        }
      }
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        offsetX: -14,
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          plotOptions: {
            bar: { columnWidth: '48%' }
          }
        }
      },
      {
        breakpoint: 1380,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          plotOptions: {
            bar: { borderRadius: 7 }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: {
            bar: { columnWidth: '50%' }
          }
        }
      },
      {
        breakpoint: 680,
        options: {
          plotOptions: {
            bar: { columnWidth: '60%' }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          }
        }
      },
      {
        breakpoint: 450,
        options: {
          plotOptions: {
            bar: { borderRadius: 6, columnWidth: '65%' }
          }
        }
      }
    ]
  }

  const lineOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      width: [1, 2],
      curve: 'smooth',
      dashArray: [5, 0]
    },
    colors: ['var(--mui-palette-divider)', 'var(--mui-palette-primary-main)'],
    legend: {
      show: false
    },
    grid: {
      padding: {
        top: -28,
        left: -11,
        right: 0,
        bottom: -15
      },
      yaxis: {
        lines: { show: false }
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    }
  }
  
  return (
    <Card>
      <Grid container>
        <Grid item xs={12} sm={8} className='border-r'>
        <CardHeader title={dictionary['navigation']['RevenueReport']} />
        <CardContent>
            <AppReactApexCharts type='bar' height={320} width='100%' series={barSeries} options={barOptions} />
          </CardContent>
        </Grid>
        <Grid item xs={12} sm={4}>
          <CardContent className='flex flex-col items-center justify-center min-bs-full gap-8'>
            <Button
              size='small'
              variant='tonal'
              onClick={handleClick}
              endIcon={<i className='tabler-chevron-down text-xl' />}
            >
              {selectedYear}
            </Button>
            <Menu
              keepMounted
              anchorEl={anchorEl}
              onClose={handleClose}
              open={Boolean(anchorEl)}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} onClick={() => handleYearChange(year)}>
                  {year}
                </MenuItem>
              ))}
            </Menu>
            <div className='flex flex-col items-center'>
              <Typography className="mb-3" variant='h3'>{formatCurrency(payments.total)}</Typography>
              <Typography variant='h5'>{dictionary['navigation'].Cash}: {formatCurrency(payments.cash)}</Typography>
              <Typography variant='h5'>{dictionary['navigation'].Card}: {formatCurrency(payments.card)}</Typography>
              <Typography variant='h5'>{dictionary['navigation'].Wallet}: {formatCurrency(payments.wallet)}</Typography>
            </div>
            <AppReactApexCharts type='line' height={80} width='100%' series={lineSeries} options={lineOptions} />
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default RevenueReport