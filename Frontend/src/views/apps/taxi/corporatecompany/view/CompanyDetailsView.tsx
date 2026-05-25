/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState } from 'react'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Avatar,
  Paper,
  Alert
} from '@mui/material'

// Icons
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PaymentIcon from '@mui/icons-material/Payment'
import ScheduleIcon from '@mui/icons-material/Schedule'
import TimerIcon from '@mui/icons-material/Timer'
import LanguageIcon from '@mui/icons-material/Language'

import { ToastContainer } from 'react-toastify'

import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop'


// Components
import CustomAvatar from '@core/components/mui/Avatar'
import 'react-toastify/dist/ReactToastify.css'

// Define proper interfaces for the component
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

// Vehicle type interface
interface VehicleType {
  id: string
  vehicleName: string
  image?: string
  capacity: number
  serviceType: string
}

// Vehicle pricing details interface
interface VehicleDetail {
  ridenowBasePrice: string
  ridenowPricePerTime: string
  ridenowBaseDistance: string
  ridenowPricePerDistance: string
  ridenowFreeWaitingTime: string
  ridenowFreeWaitingTimeAfterStart: string
  ridenowWaitingCharge: string
  ridenowCancellationFeeAfterAccept: string
  ridenowCancellationFeeAfterArrive: string
  ridenowCancellationFeeAfterStart: string
  ridenowAdminCommissionType: string
  ridenowAdminCommission: string
  ridelaterBasePrice: string
  ridelaterPricePerTime: string
  ridelaterBaseDistance: string
  ridelaterPricePerDistance: string
  ridelaterFreeWaitingTime: string
  ridelaterFreeWaitingTimeStart: string
  ridelaterWaitingCharge: string
  ridelaterCancellationFeeAfterAccept: string
  ridelaterCancellationFeeAfterArrive: string
  ridelaterCancellationFeeAfterStart: string
  ridelaterAdminCommissionType: string
  ridelaterAdminCommission: string
}

// Surge pricing interface
interface SurgePriceData {
  vehicleId: string
  surgePrice: string
  surgeDistancePrice: string
  startTime: string
  endTime: string
  availableDays: string[]
}

// Subscription interface
interface Subscription {
  id: string
  name: string
  amount: string
  validityPeriod: string
  unit: string
  noOfDrivers: string
  noOfUsers: string
}

// Company data interface
interface CompanyData {
  _id: string
  companyName: string
  companyCode: string
  companyEmail: string
  companyPhoneNumber: string
  contactPersonName: string
  contactPersonEmail: string
  contactPersonNumber: string
  noOfVehicle: string
  paymentTypes: string[]
  vehicleTypes: VehicleType[]
  country: string
  language: string
  serviceArea: string
  status: boolean
  vehicleDetails: Record<string, VehicleDetail>
  zonesurgePriceData: SurgePriceData[]
  subScriptionId: string
  data?: any // For handling nested data structure
}

// Lookup data interface
interface LookupData {
  countries: Record<string, string>
  languages: Record<string, string>
  zones: Record<string, string>
  subscriptions: Record<string, Subscription>
}

// Main component props
interface CompanyDetailsViewProps {
  companyData: CompanyData
  lookupData: LookupData
  dictionary?: any
}

// Helper component props
interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

// Pricing row props
interface PricingComparisonRowProps {
  label: string
  vehicleTypes: VehicleType[]
  vehicleDetails: Record<string, VehicleDetail>
  field: keyof VehicleDetail
  formatter?: (value: string | null, details?: VehicleDetail, field?: string) => React.ReactNode
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  )
}

// Main component
export default function CompanyDetailsView({ 
  companyData, 
  dictionary,
  lookupData 
}: CompanyDetailsViewProps) {
  const [activeTab, setActiveTab] = useState(0)

  // Use the data from the API response correctly
  const company = companyData.data || companyData
  
  // Extract data for readability
  const {
    
    companyName,
    companyCode,
    companyEmail,
    companyPhoneNumber,
    contactPersonName,
    contactPersonEmail,
    contactPersonNumber,
    noOfVehicle,
    paymentTypes,
    vehicleTypes,
    country,
    language,
    serviceArea,
    status,
    vehicleDetails,
    zonesurgePriceData,
    subScriptionId,
    currencySymbol
  } = company


  // Format helper functions
 const formatCurrency = (value: string | null | undefined): string => {
  if (!value || isNaN(Number(value))) return '-';
  
  return `${currencySymbol}${parseFloat(value).toFixed(2)}`;
};

  
  const formatTime = (time: string | null | undefined): string => {
    if (!time) return '-'
    
    return time
  }
  
  // Get subscription details
  const subscription = lookupData.subscriptions[subScriptionId] || null
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
  }

  return (
    <>
      {/* Company Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pt: 4, px: 4 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Company Logo & Basic Info */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <CustomAvatar
                src=""
                alt={companyName}
                variant="rounded"
                color="primary"
                sx={{ width: 60, height: 60, mr: 3, fontSize: '1.5rem' }}
              >
                {companyName?.charAt(0) || 'C'}
              </CustomAvatar>
              
              <Box>
                <Typography variant="h5">{companyName}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={companyCode} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mr: 2 }} 
                  />
                  <Chip 
                    label={status ? 'Active' : 'Inactive'} 
                    color={status ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs Navigation */}
      <Card>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="company detail tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Company Info" id="company-tab-0" aria-controls="company-tabpanel-0" />
          <Tab label="Ride Now Pricing" id="company-tab-1" aria-controls="company-tabpanel-1" />
          <Tab label="Ride Later Pricing" id="company-tab-2" aria-controls="company-tabpanel-2" />
          <Tab label="Surge Pricing" id="company-tab-3" aria-controls="company-tabpanel-3" />
        </Tabs>
        
        {/* Company Info Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Basic Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <InfoRow icon={<BusinessIcon />} label="Company Name" value={companyName} />
                    <InfoRow icon={<EmailIcon />} label="Company Email" value={companyEmail} />
                    <InfoRow icon={<PhoneIcon />} label="Company Phone" value={companyPhoneNumber} />
                    <InfoRow icon={<DirectionsCarIcon />} label="Number of Vehicles" value={noOfVehicle} />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Contact Person */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Contact Person" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <InfoRow icon={<PersonIcon />} label="Name" value={contactPersonName} />
                    <InfoRow icon={<EmailIcon />} label="Email" value={contactPersonEmail} />
                    <InfoRow icon={<PhoneIcon />} label="Phone" value={contactPersonNumber} />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Location & Settings */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Location & Settings" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <InfoRow 
                      icon={<LocationOnIcon />} 
                      label="Country" 
                      value={lookupData.countries[country] || country} 
                    />
                    <InfoRow 
                      icon={<LanguageIcon />} 
                      label="Language" 
                      value={lookupData.languages[language] || language} 
                    />
                    <InfoRow 
                      icon={<LocationOnIcon />} 
                      label="Service Area" 
                      value={lookupData.zones[serviceArea] || serviceArea} 
                    />
                    <InfoRow 
                      icon={<PaymentIcon />} 
                      label="Payment Types" 
                      value={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {paymentTypes?.map((type: string) => (
                            <Chip key={type} label={type} size="small" />
                          ))}
                        </Box>
                      } 
                    />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Subscription */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Subscription" />
                <Divider />
                <CardContent>
                  {subscription ? (
                    <Grid container spacing={2}>
                      <InfoRow icon={<AttachMoneyIcon />} label="Package" value={subscription.name} />
                      <InfoRow 
                        icon={<AttachMoneyIcon />} 
                        label="Amount" 
                        value={formatCurrency(subscription.amount)} 
                      />
                      <InfoRow 
                        icon={<ScheduleIcon />} 
                        label="Validity" 
                        value={`${subscription.validityPeriod} ${subscription.unit}${parseInt(subscription.validityPeriod) > 1 ? 's' : ''}`} 
                      />
                      <InfoRow 
                        icon={<DirectionsCarIcon />} 
                        label="Max Drivers" 
                        value={subscription.noOfDrivers} 
                      />
                      <InfoRow 
                        icon={<PersonIcon />} 
                        label="Max Users" 
                        value={subscription.noOfUsers} 
                      />
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No subscription details available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Vehicles */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Vehicle Types" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {vehicleTypes?.map((vehicle: VehicleType) => (
                      <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                        <Paper 
                          elevation={0} 
                          variant="outlined" 
                          sx={{ p: 2, display: 'flex', alignItems: 'center' }}
                        >
                          <Avatar 
                            src={vehicle.image ? `/images/vehicles/${vehicle.image}` : ""}
                            alt={vehicle.vehicleName}
                            sx={{ width: 50, height: 50, mr: 2 }}
                          >
                            {vehicle.vehicleName?.charAt(0) || 'V'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">{vehicle.vehicleName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Capacity: {vehicle.capacity || '-'}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Ride Now Pricing Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TimerIcon sx={{ mr: 1 }} /> Ride Now Pricing Details
          </Typography>

          {vehicleTypes?.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Pricing Parameter</TableCell>
                    {vehicleTypes.map((vehicle: VehicleType) => (
                      <TableCell key={vehicle.id} align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                        {vehicle.vehicleName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <PricingComparisonRow 
                    label="Base Distance (km)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowBaseDistance" 
                    formatter={(value) => `${value || '-'} km`}
                  />
                  <PricingComparisonRow 
                    label="Base Price" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowBasePrice" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Price per Distance" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowPricePerDistance" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Price per Time" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowPricePerTime" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Free Waiting Time (min)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowFreeWaitingTime" 
                    formatter={(value) => `${value || '-'} min`}
                  />
                  <PricingComparisonRow 
                    label="Free Waiting Time After Start (min)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowFreeWaitingTimeAfterStart" 
                    formatter={(value) => `${value || '-'} min`}
                  />
                  <PricingComparisonRow 
                    label="Waiting Charge" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowWaitingCharge" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Accept" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowCancellationFeeAfterAccept" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Arrive" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowCancellationFeeAfterArrive" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Start" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowCancellationFeeAfterStart" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Admin Commission Type" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowAdminCommissionType" 
                  />
                  <PricingComparisonRow 
                    label="Admin Commission" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridenowAdminCommission" 
                    formatter={(value, details) => {
                      
                      const commissionType = details?.ridenowAdminCommissionType;
                      
                      return commissionType === 'Percentage' ? `${value || '-'}%` : formatCurrency(value);
                    }}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No vehicle types configured for this company.</Alert>
          )}
        </TabPanel>
        
        {/* Ride Later Pricing Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ScheduleIcon sx={{ mr: 1 }} /> Ride Later Pricing Details
          </Typography>

          {vehicleTypes?.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Pricing Parameter</TableCell>
                    {vehicleTypes.map((vehicle: VehicleType) => (
                      <TableCell key={vehicle.id} align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                        {vehicle.vehicleName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <PricingComparisonRow 
                    label="Base Distance (km)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterBaseDistance" 
                    formatter={(value) => `${value || '-'} km`}
                  />
                  <PricingComparisonRow 
                    label="Base Price" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterBasePrice" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Price per Distance" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterPricePerDistance" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Price per Time" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterPricePerTime" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Free Waiting Time (min)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterFreeWaitingTime" 
                    formatter={(value) => `${value || '-'} min`}
                  />
                  <PricingComparisonRow 
                    label="Free Waiting Time After Start (min)" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterFreeWaitingTimeStart" 
                    formatter={(value) => `${value || '-'} min`}
                  />
                  <PricingComparisonRow 
                    label="Waiting Charge" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterWaitingCharge" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Accept" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterCancellationFeeAfterAccept" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Arrive" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterCancellationFeeAfterArrive" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Cancellation Fee After Start" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterCancellationFeeAfterStart" 
                    formatter={formatCurrency}
                  />
                  <PricingComparisonRow 
                    label="Admin Commission Type" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterAdminCommissionType" 
                  />
                  <PricingComparisonRow 
                    label="Admin Commission" 
                    vehicleTypes={vehicleTypes} 
                    vehicleDetails={vehicleDetails} 
                    field="ridelaterAdminCommission" 
                    formatter={(value, details) => {
                      
                      const commissionType = details?.ridelaterAdminCommissionType;
                      
                      return commissionType === 'Percentage' ? `${value || '-'}%` : formatCurrency(value);
                    }}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No vehicle types configured for this company.</Alert>
          )}
        </TabPanel>
        
        {/* Surge Pricing Tab */}
        <TabPanel value={activeTab} index={3}>
          {vehicleTypes?.map((vehicle: VehicleType) => {
            const vehicleSurgePrices = zonesurgePriceData?.filter(
              (surge: SurgePriceData) => surge.vehicleId === vehicle.id
            ) || [];
            
            return (
              <Card key={vehicle.id} variant="outlined" sx={{ mb: 4 }}>
                <CardHeader 
                  title={`${vehicle.vehicleName} Surge Pricing`} 
                  sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                />
                {vehicleSurgePrices.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Surge Price</TableCell>
                          <TableCell>Distance Price</TableCell>
                          <TableCell>Start Time</TableCell>
                          <TableCell>End Time</TableCell>
                          <TableCell>Available Days</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vehicleSurgePrices.map((surge: SurgePriceData, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{formatCurrency(surge.surgePrice)}</TableCell>
                            <TableCell>{formatCurrency(surge.surgeDistancePrice)}</TableCell>
                            <TableCell>{formatTime(surge.startTime)}</TableCell>
                            <TableCell>{formatTime(surge.endTime)}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {surge.availableDays?.map((day: string) => (
                                  <Chip key={day} label={day} size="small" />
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No surge pricing configured for this vehicle
                    </Typography>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabPanel>
      </Card>
      
      <ToastContainer />
    </>
  );
}

// Helper Components
const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <>
    <Grid item xs={12} sm={5} sx={{ display: 'flex', alignItems: 'center' }}>
      {icon}
      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        {label}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={7}>
      <Typography variant="body2">{value || '-'}</Typography>
    </Grid>
  </>
);

// Pricing comparison row - compares the same field across multiple vehicles
const PricingComparisonRow = ({ 
  label, 
  vehicleTypes, 
  vehicleDetails, 
  field, 
  formatter = (value) => value || '-' 
}: PricingComparisonRowProps) => (
  <TableRow hover>
    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
      {label}
    </TableCell>
    {vehicleTypes.map((vehicle: VehicleType) => {
      const details = vehicleDetails[vehicle.id];
      const value = details ? details[field] : null;
      
      return (
        <TableCell key={vehicle.id} align="center">
          {formatter(value, details, field)}
        </TableCell>
      );
    })}
  </TableRow>
);