/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";

import Avatar from "@mui/material/Avatar";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import WifiIcon from "@mui/icons-material/Wifi";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { BASE_IMAGE_URL } from "@/app/api/apps/taxi/endpoint";

interface DriverDetailsProps {
  zoneDetails: any[];
  selectedVehicle: any;
  onDriverChange: (value: any) => void;
  isValidationError?: boolean;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({
  zoneDetails,
  selectedVehicle,
  onDriverChange,
  isValidationError
}) => {
  const [filteredDrivers, setFilteredDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  useEffect(() => {
    if (!zoneDetails) {
      console.warn("Invalid driver data");
      setFilteredDrivers([]);

      return;
    }

    const selectedVehicleId = selectedVehicle?._id || selectedVehicle?.id;

    if (selectedVehicle) {
      const filtered = zoneDetails.filter(
        driver => 
          driver.vehicleId?.id === selectedVehicleId &&
          driver.isAvailable === true &&
          driver.isOnline === true
      );


      setFilteredDrivers(filtered);
    } else {
      const filtered = zoneDetails.filter(
        driver => 
          driver.isAvailable === true &&
          driver.isOnline === true
      );
      

      setFilteredDrivers(filtered);
    }
  }, [zoneDetails, selectedVehicle]);

  const handleDriverClick = (driver: any) => {
    if (driver.isAvailable && driver.isOnline) {
      onDriverChange(driver.driverId);
      setSelectedDriver(driver);
    }
  };

  const getVehicleImage = (driver: any) => {
    return "https://png.pngtree.com/png-clipart/20241102/original/pngtree-taxi-driver-cartoon-art-transparent-free-download-png-image_16608985.png";
  };

  const isDriverSelectable = (driver: any) => {
    return driver.isAvailable && driver.isOnline;
  };

  return (
    <div>
      <h6 className="font-bold text-lg flex items-center mb-4">
        <Avatar className="bg-primary" style={{ width: 30, height: 30 }}>
          <DirectionsCarIcon style={{ color: "white" }} />
        </Avatar>
        <span className="ml-2" style={{ fontSize: "1.1rem" }}>
          {selectedVehicle ? "Filtered Drivers" : "All Drivers"} ({filteredDrivers.length})
        </span>
      </h6>

      <div>
        {filteredDrivers.length === 0 ? (
          <p>No drivers available{selectedVehicle ? " for selected vehicle" : ""}.</p>
        ) : (
          <>
            {isValidationError && (
              <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
                Kindly select a driver before submitting.
              </div>
            )}
          
          {filteredDrivers.map((driver, index) => {
            const selectable = isDriverSelectable(driver);


            return (
              <div
                key={driver.driverId || index}
                onClick={() => handleDriverClick(driver)}
                style={{
                  display: "flex",
                  padding: "10px",
                  marginBottom: "15px",
                  border: `2px solid ${!selectable
                      ? "#cccccc"
                      : selectedDriver?.driverId === driver.driverId
                        ? "#4caf50"
                        : "#2196f3"
                    }`,
                  borderRadius: "12px",
                  cursor: selectable ? "pointer" : "not-allowed",
                  backgroundColor:
                    !selectable
                      ? "#f5f5f5"
                      : selectedDriver?.driverId === driver.driverId
                        ? "#e8f5e9"
                        : "#e3f2fd",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  opacity: selectable ? 1 : 0.7,
                }}
                onMouseEnter={(e) => selectable && (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => selectable && (e.currentTarget.style.transform = "scale(1)")}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginRight: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: selectable ? 1 : 0.6,
                  }}
                >
                  <img
                    src={getVehicleImage(driver)}
                    alt="Vehicle"
                    style={{
                      width: "70%",
                      height: "70%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                      <PersonIcon style={{ marginRight: "5px", color: "#333", fontSize: "18px" }} />
                      <span>{driver.userId?.firstName || "Unknown"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                      <DirectionsCarIcon style={{ marginRight: "5px", color: "#333", fontSize: "16px" }} />
                      <span>{driver.vehicleId?.vehicleName || "N/A"}</span>
                    </div>

                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {driver.isOnline ? (
                        <WifiIcon style={{ color: "green", marginRight: "5px", fontSize: "18px" }} />
                      ) : (
                        <WifiIcon style={{ color: "red", marginRight: "5px", fontSize: "18px" }} />
                      )}
                      <span style={{ fontSize: "12px" }}>{driver.isOnline ? "Online" : "Offline"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {driver.isAvailable ? (
                        <CheckCircleIcon style={{ color: "green", marginRight: "5px", fontSize: "18px" }} />
                      ) : (
                        <CancelIcon style={{ color: "red", marginRight: "5px", fontSize: "18px" }} />
                      )}
                      <span style={{ fontSize: "12px" }}>{driver.isAvailable ? "Available" : "Unavailable"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverDetails;
