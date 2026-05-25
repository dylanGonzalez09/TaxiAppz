/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';

import debounce from 'lodash.debounce';

import { useForm, Controller } from 'react-hook-form';

import { toast } from 'react-toastify';

import { MenuItem } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField';

import { getByRequestHistory } from '@/app/api/apps/taxi/request';
import { validateTextOnly, validateNumeric } from '@/utils/validation';
import TripHistory from './TripHistory'; // Assuming you have this component
import {fetchUsersList } from '@/app/api/apps/taxi/user';
import { fetchPrimaryZone, fetchZone } from '@/app/api/apps/taxi/zone';

interface TripData {
  completedTrips: number;
  cancelledTrips: number;
}

const UserDetails: React.FC<{ onPassengerChange: (value: string) => void, onNameChange: (value: string) => void, onZoneChange: (zone: any) => void, onUserId: (value: any) => void,  userDetails: any,isLoadingData:boolean,dictionary: any,onIsNewUserChange: (isNew: boolean) => void;}> = ({ onPassengerChange, onNameChange, onZoneChange,onUserId, userDetails,isLoadingData,dictionary,onIsNewUserChange}) => {

  const { control, handleSubmit, trigger, setValue, formState: { errors } } = useForm();
  const [tripData, setTripData] = useState<TripData>({ completedTrips: 0, cancelledTrips: 0 });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [helperText, setHelperText] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passengerName, setPassengerName] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [primaryZoneDatas, setPrimaryZoneData] = useState('');
  const [passengerNameInput, setPassengerNameInput] = useState('');
  const [passengerNumberInput, setPassengerNumberInput] = useState(''); 

  useEffect(() => {
    if (userDetails) {
      setValue('passengerNumber', userDetails.passengerNumber || '', { shouldValidate: true });
      setValue('passengerName', userDetails.passengerName || '', { shouldValidate: true });
      setPrimaryZoneData(userDetails.zoneId);
      setValue('zoneId', userDetails.zoneId);

    }
  }, [userDetails, setValue]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchUsersList();

        const zone = await fetchPrimaryZone();

        setZones(zone);

        setUsers(response);
      } catch (error) {
        toast.error(dictionary['navigation'].FailedToLoadCategories);
      }
    };

    fetchUser();
  }, []);


  const handleZoneChange = (value: string) => {
    const selectedZone = zones.find(zone => zone._id === value);

    if (selectedZone) {
      onZoneChange(selectedZone); // Send selected zone to parent
    }
  };

  const handlePassengerChange = async (value: string) => {
    onPassengerChange(value);
    setPassengerNumberInput(value);
    
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
          UserName = `${trip.user.firstName} ${trip.user.lastName ? ' ' + trip.user.lastName : ''}`;
          UserId = trip.user._id;
        }
      
        if (trip.isCompleted) completedTripsCount++;
        if (trip.isCancelled) cancelledTripsCount++;
      });

      if (completedTripsCount || cancelledTripsCount) {
        setTripData({
          completedTrips: completedTripsCount,
          cancelledTrips: cancelledTripsCount,

          // tripIds: trips.map((trip: { requestNumber: string }) => trip.requestNumber),
        });
      }

      if (UserId) {
        onUserId(UserId);
        onNameChange(UserName); // update the parent state with known user name
        setValue('passengerName', UserName, { shouldValidate: true });
      }

      // setPassengerName(UserName || '');

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
      setHelperText(filteredResults.length === 0 ? dictionary['navigation'].ThisIsANewUser : '');
      onIsNewUserChange(filteredResults.length === 0);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  }, 300);

  const handleSelectSuggestion = (user: any) => {
    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName;

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    setValue('passengerNumber', user.phoneNumber, { shouldValidate: true });

    // setValue('passengerName', `${user.firstName} ${user.lastName}`, { shouldValidate: true });
    setValue('passengerName', fullName, { shouldValidate: true })

    onUserId(user.id);

    // Update state without triggering excessive re-renders
    handlePassengerChange(user.phoneNumber);
    onNameChange(fullName);
    setPassengerNameInput(fullName);
    setPassengerNumberInput(user.phoneNumber);
    setSuggestions([]);
    setShowSuggestions(false);
    setHelperText('');
  };



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
        <Grid item xs={12}>
          <Controller
            name="passengerNumber"
            control={control}
            rules={{
              required: dictionary['navigation'].PassengerNumberRequired,
             validate: value => validateNumeric(value, dictionary),
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].PassengerNumber}
                placeholder="12345"
                error={!!fieldState?.error}
                helperText={fieldState?.error?.message}
                onBlur={() => trigger('passengerNumber')}
                onChange={(e) => {
                  field.onChange(e);
                  fetchUserSuggestions(e.target.value);
                  onPassengerChange(e.target.value);
                  trigger('passengerNumber');

                  if (suggestions.length === 0) {
                    setTripData({ completedTrips: 0, cancelledTrips: 0 });
                  }
                }}
              />
            )}
          />
          {helperText && (
            <span style={{ color: 'rgb(9 168 101)', fontSize: '0.9rem' }}>{helperText}</span>
          )}
        </Grid>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: '0',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #ddd',
              width: '100%',
            }}
          >
            {suggestions.map((user, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(user)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #ddd',
                  backgroundColor: '#f8f8f8',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d0e7ff')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f8f8f8')}
              >
                {/* {user.firstName + "" + user.lastName} - {user.phoneNumber} */}
                {`${user.firstName}${user.lastName ? ' ' + user.lastName : ''} - ${user.phoneNumber}`}
              </li>
            ))}
          </ul>
        )}

        <Grid item xs={12}>
          <Controller
            name="passengerName"
            control={control}
            rules={{
              required: dictionary['navigation'].PassengerNameisRequired,
              validate: value => validateTextOnly(value, dictionary),
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].PassengerName}
                placeholder={dictionary['navigation'].Doe}
                error={!!fieldState?.error}
                helperText={fieldState?.error?.message}
                onBlur={() => trigger('passengerName')}
                onChange={(e) => {
                  const name = e.target.value;

                  field.onChange(name);
                  setPassengerNameInput(name);
                  onNameChange(e.target.value);
                  trigger('passengerName');
                }}
              />
            )}
          />
        </Grid>

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
                  <MenuItem key={option._id} value={option._id}>
                    {option.zoneName}
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

            // tripIds={tripData.tripIds}
            />
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
};

export default UserDetails;
