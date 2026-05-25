/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';

// Type Imports
import type { ThemeColor } from '@core/types';
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';

const VehicleDetailsCard = ({ requestData,dictionary }: { requestData?: any,dictionary: any }) => {
  const typographyProps = (children: string, color: ThemeColor, className: string): TypographyProps => ({
    children,
    color,
    className,
  });

  const vehicleDetails = requestData?.[0]?.vehicleDetails ?? {};
  const driverDetails = requestData?.[0]?.driverDetails ?? {};
  const vehicleModelDetails = requestData?.[0]?.vehicleModelDetails ?? {};

  const hasValidVehicleDetails =
    vehicleDetails.vehicleName ||
    driverDetails.carNumber ||
    vehicleModelDetails.modelname ||
    vehicleDetails.image;

  return (
    <>
      {hasValidVehicleDetails && (
        <Card>
          <CardContent className="flex gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <Typography variant="h5">{dictionary['navigation'].VehicleTypeDetails}</Typography>
              </div>
              <div className="flex flex-col mt-2">
                <Typography>{vehicleDetails.vehicleName || 'N/A'}</Typography>
                <Typography>{driverDetails.carNumber || 'N/A'}</Typography>
                <Typography>{vehicleModelDetails.modelname || 'N/A'}</Typography>
              </div>
            </div>
            <div className="flex-none">
              {vehicleDetails.image && (
                <img
                  src={`${BASE_IMAGE_URL}/uploads/vehicles/${vehicleDetails.image}`}
                  alt="Vehicle"
                  style={{ width: '50px', height: '40px', borderRadius: '8px' }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default VehicleDetailsCard;
