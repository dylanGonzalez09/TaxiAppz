/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import { format } from 'date-fns'

import type { ThemeColor } from '@core/types'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'

import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'


type PayementStatusType = {
  text: string
  color: ThemeColor
}

type StatusChipColorType = {
  color: ThemeColor
}

export const paymentStatus: { [key: number]: PayementStatusType } = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
}

export const statusChipColor: { [key: string]: StatusChipColorType } = {
  'Trip Completed': { color: 'primary' },
  'Trip Started': { color: 'info' }
}

const OrderDetailHeader = ({ requestData, order,dictionary }: { requestData?: any; order: string,dictionary: any }) => {



  const dateTime = requestData[0].tripStartTime;


  if (!dateTime) {
    return <Typography variant="body2">{dictionary['navigation'].NoDateAvailable}</Typography>;
  }

  const formattedDate = format(new Date(dateTime), 'yyyy-MM-dd');
  const formatteTime = format(new Date(dateTime), ' HH:mm:ss');

  // Vars
  const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant']): ButtonProps => ({
    children,
    color,
    variant
  })

const getStatusColor = (trip: any) => {
  if (trip.isCompleted) return "success";
  if (trip.isTripStart) return "primary";
  if (trip.isDriverArrived) return "warning";
  if (trip.isCancelled) return "error";
  if (trip.isDriverStarted) return "info";

return "default";
};

  return (
    <div className='flex flex-wrap justify-between items-center gap-y-4'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <Typography variant='h5'> {`${dictionary['navigation'].Details} #${order}`}
          </Typography>
          <Chip
            variant='tonal'
            label={
              requestData[0].isCancelled ? dictionary['navigation'].TripCancelled :
                requestData[0].isCompleted ? dictionary['navigation'].TripCompleted :
                  requestData[0].isTripStart ? dictionary['navigation'].TripStarted :
                    requestData[0].isDriverArrived ? dictionary['navigation'].Arrived:
                      requestData[0].isDriverStarted ?dictionary['navigation'].Accepted :
                      dictionary['navigation'].Pending
            }

            // color='primary'
             color={getStatusColor(requestData[0])}
            size='small'
          />

        </div>
        <Typography>{`${formattedDate}, ${formatteTime} (ET)`}</Typography>
      </div>

    </div>
  )
}

export default OrderDetailHeader
