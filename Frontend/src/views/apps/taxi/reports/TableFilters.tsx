
import { useState, useEffect, useRef } from 'react';

import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';

import MenuItem from '@mui/material/MenuItem';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import CustomTextField from '@core/components/mui/TextField';

const TableFilters = ({
  setData,
  filterData,
  dictionary
}: {
  setData: (data: any[]) => void;
  filterData?: any[];
  dictionary: any;
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customer, setCustomer] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [tripType, setTripType] = useState<string>('');

  const previousFilteredDataRef = useRef<any[]>([]);

  useEffect(() => {
    if (!filterData) return;

    const filteredData = filterData.filter(product => {
      const productStartDate = new Date(product.startTime).getTime();
      const productEndDate = new Date(product.endTime).getTime();
      const filterStartDate = startDate ? startDate.getTime() : 0;
      const filterEndDate = endDate ? endDate.getTime() : Infinity;

      if (startDate && productStartDate < filterStartDate) return false;
      if (endDate && productEndDate > filterEndDate) return false;
      if (customer && product.customerName !== customer) return false;
      if (driver && product.driverName !== driver) return false;
      if (tripType && product.serviceType !== tripType) return false;

      return true;
    });

    // Only set filtered data if it has changed
    if (JSON.stringify(previousFilteredDataRef.current) !== JSON.stringify(filteredData)) {
      setData(filteredData);
      previousFilteredDataRef.current = filteredData; // Update ref to new filtered data
    }
  }, [startDate, endDate, customer, driver, tripType, filterData, setData]);

  const uniqueCustomers = Array.from(new Set(filterData?.map(product => product.customerName))) || [];
  const uniqueDrivers = Array.from(new Set(filterData?.map(product => product.driverName))) || [];
  const uniqueTripTypes = Array.from(new Set(filterData?.map(product => product.serviceType))) || [];

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={2.3}>
          <AppReactDatepicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            placeholderText={dictionary['navigation'].SelectStartDate}
            customInput={<CustomTextField label={dictionary['navigation'].StartDate} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2.3}>
          <AppReactDatepicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            placeholderText={dictionary['navigation'].SelectEndDate}
            customInput={<CustomTextField label={dictionary['navigation'].EndDate} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2.4}>
          <CustomTextField
            select
            fullWidth
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            label={dictionary['navigation'].SelectCustomer}
          >
            <MenuItem value=''>{dictionary['navigation'].AllCustomers}</MenuItem>
            {uniqueCustomers.map((customerName, index) => (
              <MenuItem key={index} value={customerName}>
                {customerName}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={2.4}>
          <CustomTextField
            select
            fullWidth
            value={driver}
            onChange={e => setDriver(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            label={dictionary['navigation'].SelectDriver}
          >
            <MenuItem value=''>{dictionary['navigation'].AllDrivers}</MenuItem>
            {uniqueDrivers.map((driverName, index) => (
              <MenuItem key={index} value={driverName}>
                {driverName}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={2.4}>
          <CustomTextField
            select
            fullWidth
            value={tripType}
            onChange={e => setTripType(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            label={dictionary['navigation'].SelectTripType}
          >
            <MenuItem value=''>{dictionary['navigation'].AllTripTypes}</MenuItem>
            {uniqueTripTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilters;
