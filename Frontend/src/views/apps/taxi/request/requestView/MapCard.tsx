'use client';

import React, { useEffect, useRef } from 'react';

import { getGoogleMapsApiKey } from '@configs/getGoogleMapsApiKey';

declare global {
  interface Window {
    google: any;
  }
}

interface MapCardProps {
  initialCoordinates: { lat: number; lng: number }[]; // Expecting two coordinates
}

const MapCard: React.FC<MapCardProps> = ({ initialCoordinates }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  
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
  }, [initialCoordinates]);

  return (
    <div>
      <div id="map" ref={mapRef} style={{ height: '95vh', width: '100%' }}></div>
    </div>
  );
};

export default MapCard;
