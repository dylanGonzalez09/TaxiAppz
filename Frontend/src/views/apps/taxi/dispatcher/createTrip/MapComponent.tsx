/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

import locationPermissionGif from '@/assets/images/location-permission.gif'; // Import your GIF
import { getGoogleMapsApiKey } from '@configs/getGoogleMapsApiKey';

import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';
import { InsideDrivers } from '@apis/mqtt';

const MapComponent: React.FC<{
  onPickPointChange: (value: { lat: number; lng: number }) => void;
  onDropPointChange: (value: { lat: number; lng: number }) => void;
  onStopPointChange: (value: { lat: number; lng: number }) => void;
  onZoneChange: (value: any) => void;
  pickupDetails: { lat: number; lng: number },
  dropDetails: { lat: number; lng: number },
  stopDetails: { lat: number; lng: number },
  zoneDetails: any,
  isLoadingData: boolean
}> = ({ 
  onPickPointChange, 
  onDropPointChange, 
  onStopPointChange, 
  onZoneChange, 
  pickupDetails, 
  dropDetails, 
  stopDetails, 
  zoneDetails, 
  isLoadingData 
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [driverCount, setDriverCount] = useState<number>(0);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [vehicleCounts, setVehicleCounts] = useState<any>({});
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const defaultCenter = { lat: 11.1271, lng: 78.6569 };
  const [isLoading, setIsLoading] = useState<boolean>(isLoadingData);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);

  // Check location permission status
  const checkLocationPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        const granted = permissionStatus.state === 'granted';

        setHasLocationPermission(granted);
        setPermissionDenied(!granted);
        setLocationChecked(true);

        permissionStatus.onchange = () => {
          const newState = permissionStatus.state === 'granted';

          setHasLocationPermission(newState);
          setPermissionDenied(!newState);
        };
      } else {
        // Fallback for browsers that don't support the Permissions API
        setLocationChecked(true);
      }
    } catch (error) {
      console.error('Permission API not supported', error);
      setLocationChecked(true);
    }
  };

  // Get current location with permission handling
  const getCurrentLocation = (map: google.maps.Map) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      setPermissionDenied(true);
      
return;
    }

    setShowPermissionPrompt(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setHasLocationPermission(true);
        setPermissionDenied(false);
        setShowPermissionPrompt(false);
        map.setCenter(currentLocation);
        map.setZoom(15);
      },
      (error) => {
        console.error('Error getting location:', error);
        setPermissionDenied(true);
        setShowPermissionPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Initialize map with permission check
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        
        const script = document.createElement('script');
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing,places,geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (mapRef.current) {
            const initialMap = new window.google.maps.Map(mapRef.current, {
              center: defaultCenter,
              zoom: 15,
            });

            setMap(initialMap);
            checkLocationPermission();
            setDirectionsRenderer(new window.google.maps.DirectionsRenderer({ map: initialMap }));
          }
        };

        script.onerror = () => {
          console.error('Failed to load Google Maps script');
        };

        document.body.appendChild(script);

        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Failed to get Google Maps API key:', error);
      }
    };

    initializeMap();
  }, []);

  // Handle zone changes and driver updates
  useEffect(() => {
    const fetchData = async () => {
      if (zoneDetails && zoneDetails.mapZone && Array.isArray(zoneDetails.mapZone)) {
        setIsLoading(true);
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        drawPolygon(zoneDetails.mapZone);

        const bodyData = {
          "topic": "web/postAllZoneDrivers",
          "message": zoneDetails.mapZone
        }

        const createdData = await InsideDrivers(bodyData);

        updateDriverMarkers(createdData);
        onZoneChange(createdData);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, [zoneDetails]);

  // Handle pickup location changes
  useEffect(() => {
    if (pickupDetails && map && polygon) {
      if (pickupDetails.lat === 0 && pickupDetails.lng === 0) {
        return;
      }

      const pickupLocation = new window.google.maps.LatLng(pickupDetails.lat, pickupDetails.lng);
      const isInsideZone = window.google.maps.geometry.poly.containsLocation(pickupLocation, polygon);

      if (isInsideZone) {
        map.setCenter(pickupLocation);
        map.setZoom(15);

        if (marker) {
          marker.setPosition(pickupLocation);
        } else {
          const newMarker = new window.google.maps.Marker({
            position: pickupLocation,
            map,
            title: "Pickup Location"
          });

          setMarker(newMarker);
        }
      } else {
        onPickPointChange({ lat: 0, lng: 0 });
        alert('Pickup location is outside the zone.');
        map.setCenter(defaultCenter);
        map.setZoom(10);
      }
    }
  }, [pickupDetails, map, polygon, marker]);

  // Calculate route between points
  useEffect(() => {
    if (!window.google || !window.google.maps) return;
    
    calculateRoute();
  }, [pickupDetails, dropDetails, stopDetails]);

  const calculateRoute = () => {
    if (!window.google || !window.google.maps || !directionsRenderer) return;
    
    if (pickupDetails && (stopDetails || dropDetails)) {
      const directionsService = new window.google.maps.DirectionsService();

      const request: google.maps.DirectionsRequest = {
        origin: { lat: pickupDetails.lat, lng: pickupDetails.lng },
        destination: {
          lat: dropDetails.lat !== 0 ? dropDetails.lat : (stopDetails.lat !== 0 ? stopDetails.lat : 0),
          lng: dropDetails.lng !== 0 ? dropDetails.lng : (stopDetails.lng !== 0 ? stopDetails.lng : 0)
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
        waypoints: stopDetails && stopDetails.lat !== 0 && stopDetails.lng !== 0
          ? [{ location: { lat: stopDetails.lat, lng: stopDetails.lng }, stopover: true }]
          : [],
      };

      directionsService.route(request, (result: google.maps.DirectionsResult | null, status: string) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    }
  };

  const drawPolygon = (zoneData: any) => {
    if (!map || !zoneData.length) return;

    const coordinates = zoneData.map((point: { lat: number; lng: number }) => ({
      lat: point.lat,
      lng: point.lng,
    }));

    if (polygon) {
      polygon.setMap(null);
    }

    const newPolygon = new window.google.maps.Polygon({
      paths: coordinates,
      strokeColor: '#FF0000',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: '#FFFFFFF',
      fillOpacity: 0.00,
    });

    newPolygon.setMap(map);
    setPolygon(newPolygon);
    map.setZoom(15);
    
    const bounds = new window.google.maps.LatLngBounds();

    coordinates.forEach((coord: { lat: any; lng: any; }) => {
      bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
    });
    map.fitBounds(bounds);
  };

  const updateDriverMarkers = (jsonObject: any) => {
    if (!map || !Array.isArray(jsonObject)) {
      setIsLoading(false);
      
return;
    }

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const newMarkers: google.maps.Marker[] = [];
    let online = 0;
    let offline = 0;
    const vehicleCounts: any = {};

    jsonObject.forEach((driver: any) => {
      const vehicleImage = driver.vehicleId?.image
        ? 'https://static.vecteezy.com/system/resources/previews/021/594/388/large_2x/taxi-graphic-clipart-design-free-png.png'
        : `${BASE_IMAGE_URL}/uploads/vehicles/${driver?.vehicleId?.image}`;

      const icon = {
        url: vehicleImage,
        size: new window.google.maps.Size(32, 32),
        scaledSize: new window.google.maps.Size(32, 32),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(16, 32),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: driver.latitude, lng: driver.longitude },
        map,
        title: `Driver ID: ${driver.driverId}`,
        icon: icon,
      });

      newMarkers.push(marker);

      if (driver.isOnline && driver.isAvailable) {
        online++;
      } else {
        offline++;
      }

      const vehicleName = driver.vehicleId?.vehicleName || 'Unknown';

      vehicleCounts[vehicleName] = (vehicleCounts[vehicleName] || 0) + 1;
    });

    markersRef.current = newMarkers;
    setDriverCount(newMarkers.length);
    setOnlineCount(online);
    setOfflineCount(offline);
    setVehicleCounts(vehicleCounts);
    setIsLoading(false);
  };

  // Periodic driver updates
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (zoneDetails && zoneDetails.mapZone) {
        try {
          setIsLoading(true);

          const bodyData = {
            "topic": "web/postAllZoneDrivers",
            "message": zoneDetails.mapZone
          }

          const createdData = await InsideDrivers(bodyData);

          updateDriverMarkers(createdData);
          onZoneChange(createdData);
        } catch (error) {
          console.error("Error in interval update:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }, 15000);
  
    return () => clearInterval(intervalId);
  }, [zoneDetails]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Enhanced permission prompt with better UI */}
      {(!hasLocationPermission && permissionDenied) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          {/* Animated location illustration */}
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <FontAwesomeIcon 
                icon={faLocationArrow} 
                style={{ 
                  fontSize: '50px', 
                  color: '#1976d2',
                  animation: 'bounce 1.5s infinite'
                }} 
              />
            </div>
            
            {/* Pulsing rings animation */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #bbdefb',
              animation: 'ripple 3s linear infinite',
              opacity: 0
            }} />
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #bbdefb',
              animation: 'ripple 3s linear infinite',
              animationDelay: '1s',
              opacity: 0
            }} />
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#333'
          }}>
            We Need Your Location
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            To provide the best experience, please allow location access. 
            Your location helps us show nearby services and accurate results.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => map && getCurrentLocation(map)}
              style={{
                padding: '12px 30px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                minWidth: '200px'
              }}
            >
              <FontAwesomeIcon
                icon={faLocationArrow}
                style={{ marginRight: '10px' }}
              />
              Allow Location Access
            </button>
            
            {/* <button
              onClick={() => setPermissionDenied(false)}
              style={{
                padding: '12px 30px',
                backgroundColor: 'transparent',
                color: '#1976d2',
                border: '2px solid #1976d2',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
            >
              Continue Without Location
            </button> */}
          </div>
          
          <p style={{
            fontSize: '14px',
            color: '#999',
            marginTop: '30px'
          }}>
            You can change this later in your browser settings
          </p>
        </div>
      )}

      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          filter: (!hasLocationPermission && permissionDenied) ? 'blur(3px)' : 'none',
          transition: 'filter 0.3s ease'
        }} 
      />

      {/* Loading state */}
      {/* {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <div style={{
            fontSize: '18px',
            color: '#333',
            fontWeight: '500'
          }}>Loading map data...</div>
        </div>
      )} */}

      {/* Count display section */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '10px',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          minWidth: '200px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333',
            margin: 0
          }}>
            Driver Status
          </h3>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%',
            backgroundColor: onlineCount > 0 ? '#4CAF50' : '#f44336'
          }} />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Online:</span>
          <span style={{ 
            fontWeight: '600', 
            color: '#4CAF50'
          }}>{onlineCount}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <span style={{ color: '#666' }}>Offline:</span>
          <span style={{ 
            fontWeight: '600', 
            color: '#f44336'
          }}>{offlineCount}</span>
        </div>
        
        <div style={{ 
          borderTop: '1px solid #eee', 
          paddingTop: '15px',
          marginBottom: '15px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333',
            margin: '0 0 10px 0'
          }}>
            Vehicle Types
          </h3>
          {Object.keys(vehicleCounts).length === 0 ? (
            <div style={{
              color: '#999',
              fontSize: '14px',
              textAlign: 'center',
              padding: '10px 0'
            }}>
              No vehicles available
            </div>
          ) : (
          Object.keys(vehicleCounts).map(vehicleName => (
            <div 
              key={vehicleName} 
              style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <span style={{ color: '#666' }}>{vehicleName}:</span>
              <span style={{ fontWeight: '600' }}>{vehicleCounts[vehicleName]}</span>
            </div>
          ))
        )}
        </div>
        
        <button
          onClick={() => map && getCurrentLocation(map)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            marginTop: '10px',
            fontSize: '14px'
          }}
        >
          <FontAwesomeIcon
            icon={faLocationArrow}
            style={{ marginRight: '8px' }}
          />
          Find My Location
        </button>
      </div>
    </div>
  );
};

export default MapComponent;