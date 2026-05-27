'use client';

import React, { useEffect, useRef } from 'react';

import { getGoogleMapsApiKey } from '@configs/getGoogleMapsApiKey';
import { getByRequestId } from '@/app/api/apps/taxi/request';

declare global {
  interface Window {
    google: any;
  }
}

interface MapCardProps {
  initialCoordinates: { lat: number; lng: number }[]; // Expecting two coordinates
  requestId?: string;
  initialDriverPosition?: { lat?: number; lng?: number };
  initialUserPosition?: { lat?: number; lng?: number };
}

const MapCard: React.FC<MapCardProps> = ({ initialCoordinates, requestId, initialDriverPosition, initialUserPosition }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const driverMarkerImgRef = useRef<HTMLImageElement | null>(null);
  const previousDriverPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const isValidCoord = (lat?: number, lng?: number) =>
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);

  const getBearing = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const lat1 = toRad(from.lat);
    const lon1 = toRad(from.lng);
    const lat2 = toRad(to.lat);
    const lon2 = toRad(to.lng);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = toDeg(Math.atan2(y, x));

    
return (bearing + 360) % 360;
  };

  
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        
        const initializeMap = () => {
          if (mapRef.current && window.google) {
            const mapOptions: google.maps.MapOptions = {
              zoom: 12,
              center: new window.google.maps.LatLng(
                initialCoordinates.length > 0 ? initialCoordinates[0].lat : 11.041491541344278,
                initialCoordinates.length > 0 ? initialCoordinates[0].lng : 76.90004215249024
              ),
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            };

            const map = new window.google.maps.Map(mapRef.current, mapOptions);

            mapInstanceRef.current = map;

            if (initialCoordinates.length === 2) {
              const directionsService = new window.google.maps.DirectionsService();

              const directionsRenderer = new window.google.maps.DirectionsRenderer({
                map,
              });

              // Define route request
              const routeRequest = {
                origin: new window.google.maps.LatLng(initialCoordinates[1].lat, initialCoordinates[1].lng),
                destination: new window.google.maps.LatLng(initialCoordinates[0].lat, initialCoordinates[0].lng),
                travelMode: window.google.maps.TravelMode.DRIVING, // Can be DRIVING, WALKING, BICYCLING, or TRANSIT
              };

              // Request directions and render on map
              directionsService.route(routeRequest, (result: any, status: string) => {
                if (status === 'OK') {
                  directionsRenderer.setDirections(result); // Render directions on the map
                } else {
                  console.error('Directions request failed due to:', status);
                }
              });
            }

            // User marker (pickup/current user point)
            if (isValidCoord(initialUserPosition?.lat, initialUserPosition?.lng)) {
              userMarkerRef.current = new window.google.maps.Marker({
                position: { lat: initialUserPosition!.lat, lng: initialUserPosition!.lng },
                map,
                title: 'User',
                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              });
            }

            // Driver marker (car icon with bearing support)
            if (isValidCoord(initialDriverPosition?.lat, initialDriverPosition?.lng)) {
              const startPos = { lat: initialDriverPosition!.lat!, lng: initialDriverPosition!.lng! };

              previousDriverPositionRef.current = startPos;

              const markerLib = window.google?.maps?.marker;

              if (markerLib?.AdvancedMarkerElement) {
                const img = document.createElement('img');

                img.src = '/images/car.png';
                img.alt = 'Driver';
                img.style.width = '22px';
                img.style.height = '44px';
                img.style.transformOrigin = '50% 50%';
                img.style.transition = 'transform 300ms linear';
                driverMarkerImgRef.current = img;

                driverMarkerRef.current = new markerLib.AdvancedMarkerElement({
                  map,
                  position: startPos,
                  title: 'Driver',
                  content: img,
                });
              } else {
                driverMarkerRef.current = new window.google.maps.Marker({
                  position: startPos,
                  map,
                  title: 'Driver',
                  icon: {
                    url: '/images/driver-car.svg',
                    scaledSize: new window.google.maps.Size(22, 44),
                  },
                });
              }
            }
          }
        };

        if (!window.google) {

          const script = document.createElement('script');
          
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing,places`;
          script.async = true;
          script.onload = initializeMap;
          
          script.onerror = () => {
            console.error('Failed to load Google Maps script');
          };
          
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('Failed to get Google Maps API key:', error);
      }
    };

    initializeGoogleMaps();
  }, [initialCoordinates, initialDriverPosition?.lat, initialDriverPosition?.lng, initialUserPosition?.lat, initialUserPosition?.lng]);

  // Poll request details and move driver marker in real time
  useEffect(() => {
    if (!requestId) return;

    const updateDriverLocation = async () => {
      try {
        const data = await getByRequestId(requestId);
        const row = Array.isArray(data) ? data[0] : null;
        const lat = row?.driverCurrentLat;
        const lng = row?.driverCurrentLng;

        if (!isValidCoord(lat, lng) || !mapInstanceRef.current || !window.google) return;

        const next = { lat, lng };
        const nextPosition = new window.google.maps.LatLng(next.lat, next.lng);

        const prev = previousDriverPositionRef.current;

        if (prev && driverMarkerImgRef.current) {
          const bearing = getBearing(prev, next);

          driverMarkerImgRef.current.style.transform = `rotate(${bearing}deg)`;
        }

        previousDriverPositionRef.current = next;

        if (driverMarkerRef.current) {
          if (typeof driverMarkerRef.current.setPosition === 'function') {
            driverMarkerRef.current.setPosition(nextPosition);
          } else {
            // AdvancedMarkerElement
            driverMarkerRef.current.position = nextPosition;
          }
        } else {
          driverMarkerRef.current = new window.google.maps.Marker({
            position: nextPosition,
            map: mapInstanceRef.current,
            title: 'Driver',
            icon: {
              url: '/images/car.png',
              scaledSize: new window.google.maps.Size(22, 44),
            },
          });
        }
      } catch (error) {
        // Non-blocking: keep the map usable even if polling fails briefly.
      }
    };

    const id = window.setInterval(updateDriverLocation, 5000);

    updateDriverLocation();

    return () => window.clearInterval(id);
  }, [requestId]);

  return (
    <div>
      <div id="map" ref={mapRef} style={{ height: '95vh', width: '100%' }}></div>
    </div>
  );
};

export default MapCard;
