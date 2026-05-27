/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { useForm } from 'react-hook-form';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CardContent, Typography } from '@mui/material';

import { getLocalizedUrl } from '@/utils/i18n';

import { getByZoneId } from '@/app/api/apps/taxi/zone';
import type { Locale } from '@/configs/i18n';
import PolygonDrawingMap from './mapDraw';


interface ViewZoneFormProps {
  lang: any;
  zoneId: string; // Pass the zone ID for editing
  dictionary:any;
}

interface FormValues {
  vehicleTypes: string[];
  paymentTypes: string[];
  vehicleDetails: Record<string, any>;
  zoneLevel: string;
  primaryZone: string;
  country: string;
  serviceLocation: string;
  surgePricing: Record<string, any>;
}

const ViewTable: React.FC<ViewZoneFormProps> = ({ lang, zoneId, dictionary }) => {
  const { lang: locale } = useParams();
  const [zoneLevel, setZoneLevel] = useState('');
  const [selectedVehicles, setSelec3tedVehicles] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [surgePricingData, setSurgePricingData] = useState<Record<string, any>>({});
  const [pricingData, setPricingData] = useState<Record<string, any>>({});
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedShape, setSelectedShape] = useState<any>(null); // To track selected shapes
  const [map, setMap] = useState<any>(null); // Map object reference
  const [combinedData, setCombinedData] = useState<any[]>([]);

  const [combinedSurgeData, setCombinedSurgeData] = useState<any[]>([]);


  const { control, handleSubmit, trigger, setValue, getValues, reset } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      vehicleTypes: [],
      paymentTypes: [],
      vehicleDetails: {},
      surgePricing: {}
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const zoneData = await getByZoneId(zoneId);

      setData(zoneData[0]);

      reset({
        vehicleTypes: zoneData[0].vehicleTypes,
        paymentTypes: zoneData[0].paymentTypes,
        vehicleDetails: zoneData[0].zonePriceDetails,
        zoneLevel: zoneData[0].zoneLevel,
        primaryZone: zoneData[0].primaryZone,
        country: zoneData[0].country,
        serviceLocation: zoneData[0].zoneName,
        surgePricing: zoneData[0].zonesurgePriceData,
      });
      setZoneLevel(zoneData[0].zoneLevel);
      setSelec3tedVehicles(zoneData[0].vehicleTypes);
      setVehicleTypes(zoneData[0].vehicleTypes);
      setPaymentTypes(zoneData[0].paymentTypes);
      setSurgePricingData(zoneData[0].zoneSurgePriceDetails);
      setPricingData(zoneData[0].zonePriceDetails);
      setPolygonCoordinates(zoneData[0].mapZone);


 

    };

    fetchData();
  }, [zoneId, reset]);


  useEffect(() => {
    const combined: any[] = Object.keys(pricingData).map(key => {
      const pricing = pricingData[key];
      const vehicle = selectedVehicles.find(v => v.id === pricing.vehicleId);

      return {
        ...pricing,
        vehicleName: vehicle ? vehicle.vehicleName : 'Unknown'
      };
    });

    setCombinedData(combined);


    const combinedData = Object.values(surgePricingData).flat().map(surge => {
      const vehicle = selectedVehicles.find(v => v.id === surge.vehicleId);

      return {
        ...surge,
        vehicleName: vehicle ? vehicle.vehicleName : 'Unknown',
      };
    });

    setCombinedSurgeData(combinedData);

  }, [pricingData, surgePricingData, selectedVehicles]);

  // Handle polygon completion (drawn polygon on the map)
  const handlePolygonComplete = (polygon: any) => {
    const path = polygon.getPath().getArray().map((coord: any) => ({
      lat: coord.lat(),
      lng: coord.lng(),
    }));

    setPolygonCoordinates(path);
  };

  return (
    <>

      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {dictionary['navigation'].ZoneMap}
          </Typography>
          {/* Polygon Drawing Map */}
          <PolygonDrawingMap
            setMap={setMap}
            setPolygonCoordinates={setPolygonCoordinates}
            setSelectedShape={setSelectedShape}
            onPolygonComplete={handlePolygonComplete}
            initialCoordinates={polygonCoordinates}
          />
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {dictionary['navigation'].RideNowPricingDetails}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{dictionary['navigation'].VehicleName}</TableCell>
                  <TableCell>{dictionary['navigation'].BasePrice}</TableCell>
                  <TableCell>{dictionary['navigation'].PricePerTime}</TableCell>
                  <TableCell>{dictionary['navigation'].BaseDistance}</TableCell>
                  <TableCell>{dictionary['navigation'].PricePerDistance}</TableCell>
                  <TableCell>{dictionary['navigation'].FreeWaitingTime}</TableCell>
                  <TableCell>{dictionary['navigation'].FreeWaitingTimeAfterStart}</TableCell>
                  <TableCell>{dictionary['navigation'].WaitingCharge}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterAccept}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterArrive}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterStart}</TableCell>
                  <TableCell>{dictionary['navigation'].AdminCommissionType}</TableCell>
                  <TableCell>{dictionary['navigation'].AdminCommission}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combinedData.map(row => (
                  <TableRow key={row.vehicleId}>
                    <TableCell>{row.vehicleName}</TableCell>
                    <TableCell>{row.ridenowBasePrice}</TableCell>
                    <TableCell>{row.ridenowPricePerTime}</TableCell>
                    <TableCell>{row.ridenowBaseDistance}</TableCell>
                    <TableCell>{row.ridenowPricePerDistance}</TableCell>
                    <TableCell>{row.ridenowFreeWaitingTime}</TableCell>
                    <TableCell>{row.ridenowFreeWaitingTimeAfterStart}</TableCell>
                    <TableCell>{row.ridenowWaitingCharge}</TableCell>
                    <TableCell>{row.ridenowCancellationFeeAfterAccept}</TableCell>
                    <TableCell>{row.ridenowCancellationFeeAfterArrive}</TableCell>
                    <TableCell>{row.ridenowCancellationFeeAfterStart}</TableCell>
                    <TableCell>{row.ridenowAdminCommissionType}</TableCell>
                    <TableCell>{row.ridenowAdminCommission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {dictionary['navigation'].RideLaterPricingDetails}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{dictionary['navigation'].VehicleName}</TableCell>
                  <TableCell>{dictionary['navigation'].BasePrice}</TableCell>
                  <TableCell>{dictionary['navigation'].PricePerTime}</TableCell>
                  <TableCell>{dictionary['navigation'].BaseDistance}</TableCell>
                  <TableCell>{dictionary['navigation'].PricePerDistance}</TableCell>
                  <TableCell>{dictionary['navigation'].FreeWaitingTime}</TableCell>
                  <TableCell>{dictionary['navigation'].FreeWaitingTimeStart}</TableCell>
                  <TableCell>{dictionary['navigation'].WaitingCharge}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterAccept}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterArrive}</TableCell>
                  <TableCell>{dictionary['navigation'].CancellationFeeAfterStart}</TableCell>
                  <TableCell>{dictionary['navigation'].AdminCommissionType}</TableCell>
                  <TableCell>{dictionary['navigation'].AdminCommission}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combinedData.map(row => (
                  <TableRow key={row.vehicleId}>
                    <TableCell>{row.vehicleName}</TableCell>
                    <TableCell>{row.ridelaterBasePrice}</TableCell>
                    <TableCell>{row.ridelaterPricePerTime}</TableCell>
                    <TableCell>{row.ridelaterBaseDistance}</TableCell>
                    <TableCell>{row.ridelaterPricePerDistance}</TableCell>
                    <TableCell>{row.ridelaterFreeWaitingTime}</TableCell>
                    <TableCell>{row.ridelaterFreeWaitingTimeStart}</TableCell>
                    <TableCell>{row.ridelaterWaitingCharge}</TableCell>
                    <TableCell>{row.ridelaterCancellationFeeAfterAccept}</TableCell>
                    <TableCell>{row.ridelaterCancellationFeeAfterArrive}</TableCell>
                    <TableCell>{row.ridelaterCancellationFeeAfterStart}</TableCell>
                    <TableCell>{row.ridelaterAdminCommissionType}</TableCell>
                    <TableCell>{row.ridelaterAdminCommission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>


      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {dictionary['navigation'].SurgePricingDetails}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{dictionary['navigation'].VehicleName}</TableCell>
                  <TableCell>{dictionary['navigation'].SurgePrice}</TableCell>
                  <TableCell>{dictionary['navigation'].SurgeDistancePrice}</TableCell>
                  <TableCell>{dictionary['navigation'].StartTime}</TableCell>
                  <TableCell>{dictionary['navigation'].EndTime}</TableCell>
                  <TableCell>{dictionary['navigation'].AvailableDays}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combinedSurgeData.map(row => (
                  <TableRow key={row._id}>
                    <TableCell>{row.vehicleName}</TableCell>
                    <TableCell>{row.surgePrice}</TableCell>
                    <TableCell>{row.surgeDistancePrice}</TableCell>
                    <TableCell>{row.startTime}</TableCell>
                    <TableCell>{row.endTime}</TableCell>
                    <TableCell>{row.availableDays.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </>
  );
};

export default ViewTable;
