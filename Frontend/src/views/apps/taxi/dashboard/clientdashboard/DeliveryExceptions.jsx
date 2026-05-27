'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))



// The Component
const LogisticsDeliveryExceptions = ({ type,logisticalCounts,dictionary}) => {
  // Hooks
  const theme = useTheme()


// Static Data: Moving the static chart data outside the component
const deliveryExceptionsChartSeriesData = {
  'user': logisticalCounts["user"]?? 0,
  'driver': logisticalCounts["driver"]?? 0,
  'zone': logisticalCounts["zone"]?? 0,
}

// for dynamic title
 const organized = type.charAt(0).toUpperCase() + type.slice(1)


  // State to control visibility
// Ensure chartSeries is an array using Object.values()
const chartSeries = Array.isArray(deliveryExceptionsChartSeriesData[type])
  ? deliveryExceptionsChartSeriesData[type]
  : Object.values(deliveryExceptionsChartSeriesData[type] ?? { Active: 0, Block: 0 });

// Calculate the total sum of the data (Active + Block)
const total = chartSeries.reduce((acc, value) => acc + value, 0);

  // Options for the chart
  const option = {
    labels: [dictionary['navigation'].Active || 'Active', dictionary['navigation'].Block || 'Block'],
    stroke: {
      width: 0
    },
    colors: [
      'var(--mui-palette-success-main)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.8)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.6)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.4)'
    ],
    dataLabels: {
      enabled: false,
      formatter(val) {
        return `${Number.parseInt(val)}%`
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      offsetY: 10,
      markers: {
        width: 8,
        height: 8,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 8 : -4
      },
      itemMargin: {
        horizontal: 15,
        vertical: 5
      },
      fontSize: '13px',
      fontWeight: 400,
      labels: {
        colors: 'var()',
        useSeriesColors: false
      }
    },
    grid: {
      padding: {
        top: 15
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            value: {
              fontSize: '24px',
              color: 'var(--mui-palette-text-primary)',
              fontWeight: 500,
              offsetY: -20
            },
            name: { offsetY: 20 },
            total: {
              show: true,
              fontSize: '0.9375rem',
              fontWeight: 500,
              label: dictionary['navigation'].Total,
              color: 'var(--mui-palette-text-secondary)',
              formatter() {
                return `${total}`; // Dynamically show the total calculated from the chart data
              }
            }
          }
        }
      }
    }
  }

 

  return (
    <Card className='bs-full'>
      <CardHeader title={`${dictionary['navigation'][organized]} ${dictionary['navigation'].TotalCount}`} /> {/* Capitalize title */}

      <CardContent>
          <AppReactApexCharts
            type='donut'
            height={452}
            width='100%'
            series={chartSeries}
            options={option}
          />
      </CardContent>
    </Card>
  )
}

export default LogisticsDeliveryExceptions
