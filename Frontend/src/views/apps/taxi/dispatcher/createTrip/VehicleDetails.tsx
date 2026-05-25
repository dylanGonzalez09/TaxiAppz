/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';

import { Car } from 'lucide-react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Avatar from '@mui/material/Avatar';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface VehicleDetailsProps {
  requestEtaData: any;
  selectedVehicle: number | null;
  SelectedonVehicleSelect: (value: any) => void;
  onVehicleSelect: (index: number | null) => void;
  tripDetails: any;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ requestEtaData, selectedVehicle, SelectedonVehicleSelect, onVehicleSelect, tripDetails }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any | null>(null);

  const vehicles = requestEtaData.zoneTypePrice.map((vehicle: any) => ({
    _id: vehicle.type_id,
    type: vehicle.type_name,
    price: vehicle.total_amount,
    distance: vehicle.distance,
    extraDistance: vehicle.distance_km,
    promoAmount: vehicle.promoAmount,
    base_price: vehicle.base_price,
    base_distance: vehicle.base_distance,
    booking_fees: vehicle.booking_fees,
    price_per_distance: vehicle.price_per_distance,
    distance_price: vehicle.distance_cost,
    waiting_charge: vehicle.waiting_charge,
    promoDiscount: vehicle.promoAmount
  }));

  const modifiedTripDetails = transformTripDetails(tripDetails);

  const handleVehicleClick = (index: number) => {
    const vehicle = vehicles[index];

    setSelectedVehicleDetails(vehicle);
    SelectedonVehicleSelect(vehicle);
    setDialogOpen(true);
  };

  return (
    <div className="mb-4">
      <h6 className="mb-4 font-bold text-lg flex items-center" style={{ marginTop: '-16%' }}>
        <Avatar className='bg-primary' style={{ width: 30, height: 30 }}>
          <DirectionsCarIcon style={{ color: 'white' }} />
        </Avatar>
        <span className="ml-2" style={{ fontSize: '1.1rem' }}>Vehicle Details</span>
      </h6>

      {vehicles.length === 0 ? (
        <p>No vehicles available for this trip type.</p>
      ) : (
        vehicles.map((vehicle: any, index: number) => {
          // const showPromo = vehicle.promoAmount !== null && vehicle.promoAmount !== 0;
          const showPromo = vehicle.promoDiscount !== 0;
          
return (
            <div
              key={index}
              className={`p-2 mb-2 rounded cursor-pointer ${selectedVehicle === index ? 'bg-green-100' : 'hover:bg-gray-100'}`}
              onClick={() => {
                handleVehicleClick(index);
                onVehicleSelect(index);
              }}
              style={{ position: 'relative' }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="font-medium">{vehicle.type}</span>
                </div>
                <span className="font-bold text-gray-700">
                  {requestEtaData.currency_symbol} {showPromo ? vehicle.promoAmount.toFixed(2) : vehicle.price.toFixed(2)}
                </span>
              </div>
              {showPromo && (
                <Typography variant="caption" color="success.main" className="ml-6">
                  Promo applied!
                </Typography>
              )}
            </div>
          );
        })
      )}

      {/* Dialog for vehicle details */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedVehicleDetails && (
            <Box
              width="450px"
              p={4}
              gap={3}
              border="2px solid #ddd"
              borderRadius="8px"
              bgcolor="#fff"
            >
              <Box textAlign="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">
                  Vehicle Details
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Thank you for choosing our service!
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}><Typography fontWeight="bold">Type :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{selectedVehicleDetails.type}</Typography></Grid>

                <Grid item xs={6}><Typography fontWeight="bold">Base Price :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{requestEtaData.currency_symbol} {selectedVehicleDetails.base_price}</Typography></Grid>

                <Grid item xs={6}><Typography fontWeight="bold">Base Distance ({requestEtaData.unit}):</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography> {selectedVehicleDetails.base_distance}</Typography></Grid>

                <Grid item xs={6}><Typography fontWeight="bold">Rate Per Distance :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{requestEtaData.currency_symbol} {selectedVehicleDetails.price_per_distance}</Typography></Grid>

                { selectedVehicleDetails.distance_price !== 0 && (
                <>
                <Grid item xs={6}><Typography fontWeight="bold">Distance Price ({selectedVehicleDetails.price_per_distance} * {selectedVehicleDetails.extraDistance.toFixed(2)} {requestEtaData.unit}):</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{requestEtaData.currency_symbol} {selectedVehicleDetails.distance_price.toFixed(2)}</Typography></Grid>
                </>
                )}

                <Grid item xs={6}><Typography fontWeight="bold">Waiting Charge :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{requestEtaData.currency_symbol} {selectedVehicleDetails.waiting_charge}</Typography></Grid>

                
                { selectedVehicleDetails.booking_fees && (
                <>
                <Grid item xs={6}><Typography fontWeight="bold">Booking Fees :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{requestEtaData.currency_symbol} {selectedVehicleDetails.booking_fees}</Typography></Grid>
                </>
                )}

                <Grid item xs={6}><Typography fontWeight="bold">Total Distance ({requestEtaData.unit}):</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>{selectedVehicleDetails.distance.toFixed(2)} {requestEtaData.unit}</Typography></Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography fontWeight="bold" color="primary">TOTAL :</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography fontWeight="bold" color="primary">
                    {/* {requestEtaData.currency_symbol} {(selectedVehicleDetails.promoAmount !== null && selectedVehicleDetails.promoAmount !== 0
                      ? selectedVehicleDetails.promoAmount
                      : selectedVehicleDetails.price).toFixed(2)} */}
                      {requestEtaData.currency_symbol} {selectedVehicleDetails.price.toFixed(2)}
                  </Typography>
                  {selectedVehicleDetails.promoAmount !== null && selectedVehicleDetails.promoAmount !== 0 && (
                    <Typography variant="caption" color="success.main">
                      Promo applied!
                    </Typography>
                  )}
                </Grid>
                { selectedVehicleDetails.promoDiscount !== 0 && (
                <>
                <Grid item xs={6}><Typography fontWeight="bold">Promo Discount :</Typography></Grid>
                <Grid item xs={6} textAlign="right"><Typography>-{requestEtaData.currency_symbol} {selectedVehicleDetails.promoDiscount.toFixed(2)}</Typography></Grid>
                </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleDetails;

const transformTripDetails = (tripDetails: any) => {
  const currentDateTime = new Date();

  const rideDate = tripDetails.dateTime
    ? tripDetails.dateTime.toISOString().split('T')[0]
    : currentDateTime.toISOString().split('T')[0];

  const rideTime = tripDetails.dateTime
    ? tripDetails.dateTime.toTimeString().split(' ')[0]
    : currentDateTime.toTimeString().split(' ')[0];

  return {
    ride_date: rideDate,
    drop_lat: tripDetails.dropCoordinates?.lat || 0,
    pickup_long: tripDetails.pickCoordinates?.lng || 0,
    drop_address: tripDetails.dropPoint || "",
    pickup_address: tripDetails.pickupPoint || "",
    ride_time: rideTime,
    pickup_lat: tripDetails.pickCoordinates?.lat || 0,
    drop_long: tripDetails.dropCoordinates?.lng || 0,
    ride_type: tripDetails.rideTime ? tripDetails.rideTime.toUpperCase() : "RIDE_NOW",
  };
};
