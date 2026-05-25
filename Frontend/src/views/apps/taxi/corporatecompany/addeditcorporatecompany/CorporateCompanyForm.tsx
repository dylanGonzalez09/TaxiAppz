'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { Stepper, Step, StepLabel, Button, Card, CardContent, Typography } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CircularProgress from '@mui/material/CircularProgress'

import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import CompanyInformation from './components/CompanyInformation'
import RideNow from './components/RideNow'
import RideLater from './components/RideLater'
import SurgePricing from './components/SurgePricing'
import { createCompany, updateCompany } from '@/app/api/apps/taxi/company'
import { useIsDemoUser } from '@/utils/demoUser'
import { fetchRoles } from '@apis/role'

// Define basic types
export interface FormValues {
  companyName: string
  companyEmail: string
  companyPhoneNumber: string
  contactPersonName: string
  contactPersonEmail: string
  contactPersonNumber: string
  country: string
  language: string
  serviceArea: string
  paymentTypes: string[]
  vehicleTypes: VehicleType[]
  noOfVehicle: string
  loginId?: string
  password?: string
  confirmPassword?: string
  selectPackage?: string
  subScriptionId?: string
  vehicleDetails: Record<string, any>
  serviceLocation?: string
  surgePricing: Record<string, any>
}

export interface VehicleType {
  id: string
  vehicleName: string
  image?: string
  capacity?: number
  serviceType?: string
}

export interface SurgePriceData {
  surgePrice: string
  surgeDistancePrice: string
  startTime: string
  endTime: string
  availableDays: string[]
}

// Steps for the stepper
const steps = [
  { title: 'Company Information', subtitle: 'Your Company Details' },
  { title: 'Ride Now', subtitle: 'Get a car immediately' },
  { title: 'Ride Later', subtitle: 'Schedule for a future time' },
  { title: 'Surge Price', subtitle: 'Understand pricing during peak times' }
]

interface CorporateCompanyFormProps {
  dictionary: any
  isEditing?: boolean
  editData?: any
}

const CorporateCompanyForm: React.FC<CorporateCompanyFormProps> = ({ 
  dictionary, 
  isEditing = false, 
  editData = null, 
}) => {
  const router = useRouter()
  const { checkDemoStatus } = useIsDemoUser()
  
  // Form state
  const [activeStep, setActiveStep] = useState<number>(0)
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>([])
  const [surgePricingData, setSurgePricingData] = useState<Record<string, SurgePriceData[]>>({})
  const [loading, setLoading] = useState<boolean>(false)

  // Initialize form
  const { 
    control, 
    watch, 
    handleSubmit, 
    trigger, 
    setValue, 
    getValues, 
    clearErrors, 
    formState: { errors } 
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      vehicleDetails: {},
      surgePricing: {},
      companyName: '',
      companyEmail: '',
      companyPhoneNumber: '',
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonNumber: '',
      serviceArea: '',
      paymentTypes: [],
      vehicleTypes: [],
      noOfVehicle: '',
      subScriptionId: '',
    }
  })

  // Load existing data for editing
  useEffect(() => {
    if (isEditing && editData) {
      // Set basic company information
      setValue('companyName', editData.companyName || '')
      setValue('companyEmail', editData.companyEmail || '')
      setValue('companyPhoneNumber', editData.companyPhoneNumber || '')
      setValue('contactPersonName', editData.contactPersonName || '')
      setValue('contactPersonEmail', editData.contactPersonEmail || '')
      setValue('contactPersonNumber', editData.contactPersonNumber || '')
      setValue('country', editData.country || '')
      setValue('language', editData.language || '')
      setValue('serviceArea', editData.serviceArea || '')
      setValue('noOfVehicle', editData.noOfVehicle || '')
      setValue('paymentTypes', editData.paymentTypes || [])
      setValue('subScriptionId', editData.subScriptionId || '')
      
      // Set vehicle types
      if (editData.vehicleTypes && editData.vehicleTypes.length > 0) {
        setSelectedVehicles(editData.vehicleTypes)
        setValue('vehicleTypes', editData.vehicleTypes)
      }
      
      // Set vehicle details
      if (editData.vehicleDetails) {
        setValue('vehicleDetails', editData.vehicleDetails)
      }
      
      // Format surge pricing data
      if (editData.zonesurgePriceData && editData.zonesurgePriceData.length > 0) {
        const formattedSurgePricing: Record<string, SurgePriceData[]> = {}
        
        editData.zonesurgePriceData.forEach((surge: any) => {
          if (!formattedSurgePricing[surge.vehicleId]) {
            formattedSurgePricing[surge.vehicleId] = []
          }
          
          formattedSurgePricing[surge.vehicleId].push({
            surgePrice: surge.surgePrice || '',
            surgeDistancePrice: surge.surgeDistancePrice || '',
            startTime: surge.startTime || '',
            endTime: surge.endTime || '',
            availableDays: surge.availableDays || []
          })
        })
        
        setSurgePricingData(formattedSurgePricing)
        setValue('surgePricing', formattedSurgePricing)
      }
    }
  }, [isEditing, editData, setValue])

  // Step navigation
  const handleStepClick = async (step: number) => {
    
    const isStepValid = await trigger()
    
    if (isStepValid || step < activeStep) {
    
      setActiveStep(step)
    } else {
      toast.error('Please fill in all required fields!')
    }
  }

  const handleNext = async () => {
    const isStepValid = await trigger()
    
    if (isStepValid) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  // Handle vehicle selection
  const handleChangeVehicles = (value: VehicleType[]) => {
      const validVehicles = value.filter(v => v && v.id);
      
      if (validVehicles.length !== value.length) {
        console.warn('Some selected vehicles had invalid IDs and were filtered out');
      }
      
      setSelectedVehicles(validVehicles);
      setValue('vehicleTypes', validVehicles);
    
    // Update vehicle details
    const updatedVehicleDetails: Record<string, any> = { ...getValues('vehicleDetails') }
    const validVehicleIds = value.map(vehicle => vehicle.id).filter(Boolean)
    
    // Add new vehicles and remove deleted ones
    validVehicleIds.forEach(vehicleId => {
      if (!updatedVehicleDetails[vehicleId]) {
        updatedVehicleDetails[vehicleId] = {}
      }
    })
    
    Object.keys(updatedVehicleDetails).forEach(key => {
      if (!validVehicleIds.includes(key) && key !== '[object Object]') {
        delete updatedVehicleDetails[key]
      }
    })
    
    // Remove invalid entries
    if (updatedVehicleDetails['[object Object]']) {
      delete updatedVehicleDetails['[object Object]']
    }
    
    setValue('vehicleDetails', updatedVehicleDetails)
  }

// Handle surge pricing changes
const handleSurgePricingChange = (surgePricing: Record<string, SurgePriceData[]>) => {
  if (JSON.stringify(surgePricingData) !== JSON.stringify(surgePricing)) {
    setSurgePricingData(surgePricing);
    setValue('surgePricing', surgePricing);
  }
}

  // Form submission
  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const toastId = toast.loading(isEditing ? 'Updating company...' : 'Creating company...')

    try {
      // Format surge pricing data
      const convertedSurgePricing = Object.keys(surgePricingData).flatMap(vehicleId => 
        surgePricingData[vehicleId].map(surgeDetails => ({
          vehicleId,
          surgePrice: surgeDetails.surgePrice || "",
          surgeDistancePrice: surgeDetails.surgeDistancePrice || "",
          startTime: surgeDetails.startTime || "",
          endTime: surgeDetails.endTime || "",
          availableDays: surgeDetails.availableDays || []
        }))
      )

      // Format vehicle types
      const formattedVehicleTypes = selectedVehicles.map(vehicle => ({
        id: vehicle.id,
        vehicleName: vehicle.vehicleName,
        image: vehicle.image || "",
        capacity: vehicle.capacity || 0,
        serviceType: vehicle.serviceType || ""
      }))

      // Create company data object
      const companyData: Record<string, any> = {
        companyName: data.companyName || "",
        companyEmail: data.companyEmail || "",
        companyPhoneNumber: data.companyPhoneNumber || "",
        contactPersonName: data.contactPersonName || "",
        contactPersonEmail: data.contactPersonEmail || "",
        contactPersonNumber: data.contactPersonNumber || "",
        country: data.country || "",
        language: data.language || "",
        serviceArea: data.serviceArea || "",
        paymentTypes: data.paymentTypes || [],
        vehicleTypes: formattedVehicleTypes,
        noOfVehicle: data.noOfVehicle || "",
        vehicleDetails: data.vehicleDetails || {},
        zonesurgePriceData: convertedSurgePricing,
        subScriptionId: data.subScriptionId || "",
      }

      // Add fields specific to create operation
      if (!isEditing) {
        
        const roles = await fetchRoles()
        
        const filteredIds = roles
          .filter((item: { role: string }) => item.role === "Corporate companies")
          .map((item: { id: any }) => item.id)

        // Add create-specific fields
        companyData.companyCode = "CORP-" + Date.now().toString().substring(7)
        companyData.password = data.password || ""
        companyData.firstName = data.companyName ? data.companyName.split(' ')[0] : ""
        companyData.lastName = data.companyName ? data.companyName.split(' ').slice(1).join(' ') : ""
        companyData.email = data.companyEmail || ""
        companyData.phoneNumber = data.companyPhoneNumber || ""
        companyData.emergencyNumber = data.contactPersonNumber || ""
        companyData.roleIds = filteredIds || []
        companyData.gender = "Male"
        companyData.active = true
        companyData.zoneId = data.serviceArea || ""

        await createCompany(companyData)
        toast.success('Corporate company created successfully!')
      } else {
        // Only include password if provided in edit mode
        if (data.password) {
          companyData.password = data.password
        }
        
        await updateCompany(editData._id, companyData)
        toast.success('Corporate company updated successfully!')
      }
      
      router.push('/apps/taxi/corporatecompany')
    } catch (error) {
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} corporate company. Please try again.`)
      console.error(`Error ${isEditing ? 'updating' : 'creating'} corporate company:`, error)
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  // Render current step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CompanyInformation
            control={control}
            watch={watch}
            clearErrors={clearErrors}
            formErrors={errors}
            handleChangeVehicles={handleChangeVehicles}
            selectedVehicles={selectedVehicles}
            setPaymentTypes={(values) => setValue('paymentTypes', values)}
            paymentTypes={watch('paymentTypes') || []}
            dictionary={dictionary}
            isEditing={isEditing}
            editData={editData}
          />
        )
      case 1:
        return <RideNow 
          control={control} 
          selectedVehicles={selectedVehicles} 
          isRideNow={true} 
          dictionary={dictionary}
        />
      case 2:
        return <RideLater 
          control={control} 
          selectedVehicles={selectedVehicles} 
          isRideNow={false} 
        />
      case 3:
        return <SurgePricing 
          selectedVehicles={selectedVehicles} 
          onSurgePriceChange={handleSurgePricingChange}
          initialData={surgePricingData}
          dictionary={dictionary}
        />
      default:
        return null
    }
  }

  const isSubmitDisabled = checkDemoStatus() || loading

  return (
    <>
      <StepperWrapper>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={index} onClick={() => handleStepClick(index)}>
              <StepLabel StepIconComponent={StepperCustomDot}>
                <div className='step-label'>
                  <div>
                    <Typography className='step-title'>{step.title}</Typography>
                    <Typography className='step-subtitle'>{step.subtitle}</Typography>
                  </div>
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </StepperWrapper>
      
      <Card className='mt-4'>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
              <Button
                variant='contained'
                color='secondary'
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Back
              </Button>

              <div className="flex gap-3">
                {isEditing && (
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => router.push('/apps/taxi/corporatecompany')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}

                <Button
                  variant='contained'
                  color='primary'
                  type='button'
                  onClick={activeStep === 3 ? handleSubmit(onSubmit) : handleNext}
                  disabled={isSubmitDisabled}
                >
                  {loading ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : activeStep === 3 ? (
                    isEditing ? 'Save Changes' : 'Submit'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToastContainer />
    </>
  )
}

export default CorporateCompanyForm