/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Type Imports
import type { TypographyProps } from '@mui/material/Typography'

import type { ThemeColor } from '@core/types'

// Component Imports
import { getInitials } from '@/utils/getInitials'
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint'
import { useIsDemoUser } from '@/utils/demoUser'

// Util: Get Avatar
const getAvatar = ({ avatar, customer }: { avatar?: string; customer: string }) => {
  return avatar ? <Avatar src={avatar} /> : <Avatar>{getInitials(customer)}</Avatar>
}

// Util: Mask phone number for demo user
const maskPhoneNumber = (phone?: string): string => {
  if (!phone || phone.length <= 5) return phone || 'N/A'
  
return phone.slice(0, phone.length - 5) + '*****'
}

// Main Component
const CustomerDetails = ({ requestData,dictionary }: { requestData?: any,dictionary: any }) => {
    const { checkDemoStatus } = useIsDemoUser();
  
  const hasValidDriverDetails =
    requestData?.[0]?.driverDetails &&
    (requestData[0].driverDetails.firstName ||
      requestData[0].driverDetails.lastName ||
      requestData[0].driverDetails.phoneNumber)

  return (
    <>
      {/* User Details */}
      <Card>
        <CardContent className="flex flex-col gap-6">
          <Typography variant="h5">{dictionary['navigation'].UserDetails}</Typography>
          <div className="flex items-center gap-3">
            {getAvatar({
              avatar: requestData[0]?.userDetails.profilePic,
              customer: `${requestData[0]?.userDetails.firstName}${requestData[0]?.userDetails.lastName || 'N/A'}`
            })}
            <div className="flex flex-col">
              <Typography color="text.primary" className="font-medium">
                {requestData[0]?.userDetails.firstName || 'N/A'}
              </Typography>
              <Typography>
                Phone No:{' '}
                {checkDemoStatus()
                  ? maskPhoneNumber(requestData[0]?.userDetails.phoneNumber)
                  : requestData[0]?.userDetails.phoneNumber || 'N/A'}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Details (if available) */}
      {hasValidDriverDetails && (
        <Card className="mt-5">
          <CardContent className="flex flex-col gap-6">
            <Typography variant="h5">{dictionary['navigation'].DriverDetails}</Typography>
            <div className="flex items-center gap-3">
              {getAvatar({
                avatar: `${BASE_IMAGE_URL}/uploads/vehicles${requestData[0].driverDetails.profilePic}`,
                customer: `${requestData[0].driverDetails.firstName}${requestData[0].driverDetails.lastName || 'N/A'}`
              })}
              <div className="flex flex-col">
                <Typography color="text.primary" className="font-medium">
                  {requestData[0].driverDetails.firstName || 'N/A'}
                </Typography>
                <Typography>
                  Phone No:{' '}
                  {checkDemoStatus()
                    ? maskPhoneNumber(requestData[0]?.driverDetails.phoneNumber)
                    : requestData[0]?.driverDetails.phoneNumber || 'N/A'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default CustomerDetails
