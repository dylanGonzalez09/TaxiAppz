/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';

import debounce from 'lodash.debounce';

import { useForm, Controller } from 'react-hook-form';

import { toast } from 'react-toastify';

import { Autocomplete , MenuItem } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField';

import { fetchActiveCountry } from '@/app/api/apps/taxi/country';

import { validPhoneNumber , validateTextOnly } from '@/utils/validation';


import { getByRequestHistory } from '@/app/api/apps/taxi/request';

import TripHistory from './TripHistory'; // Assuming you have this component
import {fetchUsersList } from '@/app/api/apps/taxi/user';
import { getZoneListByZoneId, fetchZone } from '@/app/api/apps/taxi/zone';

interface TripData {
  completedTrips: number;
  cancelledTrips: number;
}

const UserDetails: React.FC<{
  onPassengerChange: (value: string) => void,
  onNameChange: (value: string) => void,
  onEmailChange: (value: string) => void,
  onZoneChange: (zone: any) => void,
  onUserId: (value: any) => void,
  onDialCodeChange: (value: string) => void,
  onCountryChange?: (countryId: string) => void
  onNewUserChange?: (value: boolean) => void
  isNewUser: boolean,
  userDetails: any,
  isLoadingData:boolean,
  dictionary: any,
  zoneId:any
}> = ({ onPassengerChange, onNameChange,onEmailChange,isNewUser,onNewUserChange, onZoneChange,onUserId,onDialCodeChange,onCountryChange, userDetails,isLoadingData,dictionary,zoneId}) => {


  const { control, handleSubmit, trigger, setValue, formState: { errors } } = useForm({
  mode: 'onChange'
})

  const [tripData, setTripData] = useState<TripData>({ completedTrips: 0, cancelledTrips: 0 });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [helperText, setHelperText] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passengerName, setPassengerName] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([])
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null)
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null)
  const [dialCodeSearch, setDialCodeSearch] = useState<string>('')
  const [primaryZoneDatas, setPrimaryZoneData] = useState('');


useEffect(() => {
  // if (!userDetails || countries.length === 0) return;

  if (userDetails.passengerNumber !== undefined) {
    setValue(
      'passengerNumber',
      userDetails.passengerNumber || '',
      { shouldValidate: true }
    )
    trigger('passengerNumber')
  }

  if (userDetails.passengerName !== undefined) {
    setValue(
      'passengerName',
      userDetails.passengerName || '',
      { shouldValidate: true }
    )
  }

  if (userDetails.passengerEmail !== undefined) {
    setValue(
      'passengerEmail',
      userDetails.passengerEmail || '',
      { shouldValidate: true }
    )
  }

  if(userDetails.zoneId != undefined){
    setPrimaryZoneData(userDetails.zoneId)

    setValue('zoneId', userDetails.zoneId)
  }
}, [userDetails, setValue,trigger])


  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetchUsersList(zoneId);

  //       const zone:any = await getZoneListByZoneId(zoneId);

  //       setZones(zone);

  //       setUsers(response);
  //     } catch (error) {
  //       toast.error(dictionary['navigation'].FailedToLoadCategories);
  //     }
  //   };

  //   fetchUser();
  // }, [dictionary,zoneId]);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await fetchUsersList(zoneId)

      const zone: any = await getZoneListByZoneId(zoneId)

      const countryList = await fetchActiveCountry()

      setCountries(countryList)

      setZones(zone)

      setUsers(response)
    } catch (error) {
      toast.error(dictionary['navigation'].FailedToLoadCategories)
    }
  }

  fetchUser()
}, [dictionary, zoneId])

  const handleZoneChange = (value: string) => {
    const selectedZone = zones.find(zone => zone._id === value || zone.id === value);

    if (selectedZone) {
      onZoneChange(selectedZone); // Send selected zone to parent
    }
  };

  const handlePassengerChange = async (value: string) => {
    onPassengerChange(value);

    try {
      const response = await getByRequestHistory(value);
      const data = response || [];

      let completedTripsCount = 0;
      let cancelledTripsCount = 0;
      let UserName = '';
      let UserId = '';

      const trips = Array.isArray(data) ? data : [];

      trips.forEach((trip: { isCompleted: boolean; isCancelled: boolean; user: any }) => {

        if (trip.user) {
          UserName = `${trip.user.firstName} ${trip.user.lastName || ''}`;
          UserId = trip.user._id;
        }

        if(UserName) {

          onNewUserChange?.(false)
        }

        if (trip.isCompleted) completedTripsCount++;
        if (trip.isCancelled) cancelledTripsCount++;
      });

      setTripData({
        completedTrips: completedTripsCount,
        cancelledTrips: cancelledTripsCount,

        // tripIds: trips.map((trip: { requestNumber: string }) => trip.requestNumber),
      });

      setPassengerName(UserName || '');

    } catch (error) {
      console.error('Error fetching trip history:', error);
    }
  };

const fetchUserSuggestions = debounce(async (query: string) => {
    if (query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      setHelperText('');

return;
    }

    try {
      const filteredResults = users.filter((user) => user.phoneNumber.includes(query));

      setSuggestions(filteredResults);
      setShowSuggestions(filteredResults.length > 0);

      if(filteredResults.length === 0) {

        setHelperText(dictionary['navigation'].ThisIsANewUser || 'This is a new user');
      }

 if(filteredResults.length === 0) {

         onNewUserChange?.(true)

         setHelperText(
           dictionary['navigation'].ThisIsANewUser ||
           'This is a new user'
         )
       } else {

         onNewUserChange?.(false)

         setHelperText('')
}

    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
}, 300);

const handleSelectSuggestion = (user: any) => {
  const country = countries.find(c => c.id === user.country)

  setValue('passengerNumber', user.phoneNumber, {
    shouldValidate: true
  })

  setValue(
    'passengerName',
    `${user.firstName} ${user.lastName || ''}`,
    {
      shouldValidate: true
    }
  )
  setValue(
    'passengerEmail',
    `${user.email || ''}`,
    {
      shouldValidate: true
    }
  )

  if (country) {
    setSelectedDialCode(country.dial_code)

    setSelectedPhoneLength(country.phoneLength)

    setValue('dialCode', country.dial_code, {
      shouldValidate: true
    })

    trigger('passengerNumber')

    onDialCodeChange(country.dial_code)

    onCountryChange?.(country.id)

    onNewUserChange?.(false)
  }

  onUserId(user.id)

  handlePassengerChange(user.phoneNumber)

  onNameChange(`${user.firstName} ${user.lastName || ''}`)

  setSuggestions([])

  setShowSuggestions(false)

  setHelperText('')

}



  const hasTrips = tripData.completedTrips > 0 || tripData.cancelledTrips > 0;

  return (
    <div className="mb-4">
      <h6 className="mb-4 font-bold text-lg flex items-center" style={{ marginTop: '-16%' }}>
        <Avatar className="bg-primary" style={{ width: 30, height: 30 }}>
          <PersonIcon style={{ color: 'white' }} />
        </Avatar>
        <span className="ml-2" style={{ fontSize: '1.1rem' }}>{dictionary['navigation'].UserDetails}</span>
      </h6>

    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
       <Controller
          name='dialCode'
          control={control}
          rules={{
            required:
              dictionary['navigation'].DialCodeRequired||
              'Dial code is required'
          }}

          // defaultValue={selectedDialCode || ''}
          render={({ field, fieldState }) => (
          <Autocomplete
          fullWidth
          options={countries}
          value={
           countries.find(
             c =>
               c.dial_code ===
               (field.value || userDetails?.dialCode)
           ) ?? null
         }
          inputValue={dialCodeSearch}
          onInputChange={(_, value) => {
            setDialCodeSearch(value)
          }}
          openOnFocus
          filterOptions={(options, state) => {
            const input = state.inputValue
              .toLowerCase()
              .trim()

            return options.filter(option => {
              const name = String(
                option.name || ''
              ).toLowerCase()

              const dial = String(
                option.dial_code || ''
              ).toLowerCase()

              return (
                name.includes(input) ||
                dial.includes(input)
              )
            }
            )}}
          autoHighlight
          onChange={(_, newValue) => {
            const newDialCode = newValue?.dial_code ?? ''

            field.onChange(newDialCode)

            setSelectedDialCode(newDialCode)

            setDialCodeSearch('')

            if (newValue) {
              setSelectedPhoneLength(newValue.phoneLength)

              onCountryChange?.(newValue.id)
            }

            trigger('passengerNumber')

            onDialCodeChange(newDialCode)
          }}
          getOptionLabel={option =>
            `${option.dial_code || ''}`
          }
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {`${option.dial_code} (${option.name})`}
            </li>
          )}
          renderInput={params => (
            <CustomTextField
              {...params}
              label={
                dictionary?.navigation?.DialCode ||
                'Dial Code'
              }
              placeholder={
                dictionary?.navigation?.Search ||
                'Search'
              }
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option?.dial_code === value?.dial_code
          }
        />
      )}
    />
      </Grid>

        <Grid item xs={12} sm={8} style={{ position: 'relative' }}>
          <Controller
            name='passengerNumber'
            control={control}
            rules={{
              required: dictionary['navigation'].PassengerNumberRequired,

              // validate: value => validPhoneNumber(value, selectedPhoneLength, dictionary)
              validate: value => {
               const selectedCountry = countries.find(
                 c => c.id === userDetails?.countryId
               )

            const phoneLength = selectedCountry?.phoneLength || 0

             return validPhoneNumber(
               value,
               phoneLength,
               dictionary
             )
}
            }}
            render={({ field, fieldState }) => (
              <div style={{ position: 'relative' }}>
                <CustomTextField
                  fullWidth
                  label={dictionary['navigation'].PassengerNumber}
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',

                    // maxLength: selectedPhoneLength || 16
                  }}
                  onChange={e => {
                    const raw = e.target.value
                    const maxLen = selectedPhoneLength || 16
                    const value = raw.replace(/\D/g, '').slice(0, maxLen)

                    field.onChange(value)
                    onUserId(null)
                    setValue('passengerEmail', '')

                    onPassengerChange(value)

                    // Continue to show user suggestions
                    fetchUserSuggestions(value)
                  }}
             onBlur={async () => {
           const phoneValue = (field.value || '').replace(/\D/g, '')

           if (phoneValue) {
             const foundUser = users.find(
               (user: any) => (user.phoneNumber || '').replace(/\D/g, '') === phoneValue
             )

             if (foundUser) {
               const userId = foundUser.id || foundUser._id
               const userName = `${foundUser.firstName} ${foundUser.lastName || ''}`
               const userEmail = String(foundUser.email || '')

               setValue('passengerName', userName)
               setValue('passengerEmail', userEmail)
               onNameChange(userName)
               onUserId(userId)


               onNewUserChange?.(false)

               handlePassengerChange(phoneValue)
             } else {

  onNewUserChange?.(true)
      }
    }
}}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      marginTop: 4,
                      maxHeight: 200,
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {suggestions.map((user, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectSuggestion(user)}
                        style={{
                          padding: 10,
                          cursor: 'pointer',
                          borderBottom: idx < suggestions.length - 1 ? '1px solid #ddd' : 'none'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'white'
                        }}
                      >
                        {user.firstName} {user.lastName || ''} - {user.phoneNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          />
        </Grid>

         <Grid item xs={12}>
          <Controller
            name='passengerName'
            control={control}
            rules={{
              required: dictionary['navigation'].PassengerNameisRequired || 'passenger name is Required',
              validate: value => validateTextOnly(value, dictionary)
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].PassengerName}
                placeholder={dictionary['navigation'].Doe}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={e => {
                  field.onChange(e)
                  onNameChange(e.target.value)
                }}
              />
            )}
          />
        </Grid>

       {isNewUser && (
         <Grid item xs={12}>
           <Controller
             name='passengerEmail'
             control={control}
             rules={{
               required: dictionary['navigation'].passengerEmailisRequired || 'Passenger Email is Required',
               pattern: {
                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                 message: dictionary['navigation'].InvalidEmail || 'Invalid email address'
               }
             }}
             render={({ field, fieldState }) => (
               <CustomTextField
                 {...field}
                 fullWidth
                 label={dictionary['navigation'].passengerEmail || 'Passenger Email'}
                 placeholder={dictionary['navigation'].Doe || 'example@gmail.com'}
                 error={!!fieldState.error}
                 helperText={fieldState.error?.message}
                 onChange={e => {
                   field.onChange(e)
                   onEmailChange(e.target.value)
                 }}
               />
                )}
                    />
                  </Grid>
                )}

        <Grid item xs={12}>
          <Controller
            name="zoneId"
            control={control}
            rules={{ required: dictionary['navigation'].ZoneRequired }}
            defaultValue={primaryZoneDatas || ''}  // Ensure a fallback value is provided
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={dictionary['navigation'].SelectZone}
                placeholder={dictionary['navigation'].SelectZone}
                error={!!errors.zoneId}
                onChange={(e) => {
                  field.onChange(e); // Update react-hook-form state
                  handleZoneChange(e.target.value); // Additional handler
                }}
              >
                {zones.map((option) => (
                  <MenuItem key={option._id || option.id} value={option._id || option.id}>
                    {`${option.zoneName} ( ${option.zoneLevel} )`}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>
        <Grid item xs={12} className='mt-3'>
          {tripData ? (
            <TripHistory
              completedTrips={tripData.completedTrips}
              cancelledTrips={tripData.cancelledTrips}
              dictionary={dictionary}

            // tripIds={tripData.tripIds}
            />
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
};

export default UserDetails;
