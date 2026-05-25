/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';

import { getGoogleMapsApiKey } from '@configs/getGoogleMapsApiKey';

declare global {
  interface Window {
    google: any;
  }
}

const PolygonDrawingMap: React.FC<{
  setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>,
  setPolygonCoordinates: React.Dispatch<React.SetStateAction<{ lat: number, lng: number }[]>>,
  setSelectedShape: React.Dispatch<React.SetStateAction<google.maps.Polygon | null>>,
  onPolygonComplete: (coordinates: { lat: number, lng: number }[]) => void,
  initialCoordinates: { lat: number; lng: number }[];
}> = ({ setMap, setPolygonCoordinates, setSelectedShape, onPolygonComplete, initialCoordinates }) => {

  const mapRef = useRef<HTMLDivElement | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const [initialized, setInitialized] = useState(false);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        
        const initialize = () => {
          if (mapRef.current && window.google && !initialized) {

            const mapOptions: google.maps.MapOptions = {
              zoom: 11,
              center: new window.google.maps.LatLng(
                initialCoordinates.length > 0 ? initialCoordinates[0].lat : 11.041491541344278,
                initialCoordinates.length > 0 ? initialCoordinates[0].lng : 76.90004215249024
              ),
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            };

            const newMap = new window.google.maps.Map(mapRef.current, mapOptions);

            setMap(newMap);

            const drawingManagerOptions: google.maps.drawing.DrawingManagerOptions = {
              drawingControl: false,
              polygonOptions: {
                fillColor: "#1E90FF",
                fillOpacity: 0.45,
                strokeColor: "#1E90FF",
                strokeWeight: 2,
                editable: true,
              },
            };

            const newDrawingManager = new window.google.maps.drawing.DrawingManager(drawingManagerOptions);

            newDrawingManager.setMap(newMap);
            drawingManagerRef.current = newDrawingManager;

            window.google.maps.event.addListener(newDrawingManager, 'overlaycomplete', (e: google.maps.drawing.OverlayCompleteEvent) => {
              if (e.type === window.google.maps.drawing.OverlayType.POLYGON) {
                newDrawingManager.setDrawingMode(null);
                const newShape = e.overlay as google.maps.Polygon;

                setSelectedShape(newShape);
                setPolygonCoordinates(logCoordinates(newShape));

                // Disable editing after drawing is complete
                newShape.setEditable(false);

                google.maps.event.addListener(newShape.getPath(), 'set_at', () => logCoordinates(newShape));
                google.maps.event.addListener(newShape.getPath(), 'insert_at', () => logCoordinates(newShape));
                google.maps.event.addListener(newShape.getPath(), 'remove_at', () => logCoordinates(newShape));

                // Adjust map view to fit the drawn polygon
                fitPolygonToBounds(newMap, newShape);
              }
            });

            setInitialized(true);
          }
        };

        const logCoordinates = (shape: google.maps.Polygon) => {
          const path = shape.getPath();

          const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));

          onPolygonComplete(coordinates);

          return coordinates;
        };

        // Function to fit the polygon within the view
        const fitPolygonToBounds = (map: google.maps.Map, polygon: google.maps.Polygon) => {
          const bounds = new window.google.maps.LatLngBounds();
          const path = polygon.getPath();

          path.forEach((latLng: google.maps.LatLng) => {
            bounds.extend(latLng);
          });

          map.fitBounds(bounds);  // Adjust the map view to fit the polygon
        };

        if (!window.google) {
          const script = document.createElement('script');
          
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing,places`;
          script.async = true;
          script.onload = initialize;
          
          script.onerror = () => {
            console.error('Failed to load Google Maps script');
          };
          
          document.head.appendChild(script);
        } else {
          initialize();
        }
      } catch (error) {
        console.error('Failed to get Google Maps API key:', error);
      }
    };

    initializeGoogleMaps();
  }, [setMap, setSelectedShape, onPolygonComplete, initialized]);

  useEffect(() => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null); // Remove the previous polygon
    }

    if (initialCoordinates.length > 0 && window.google) {
      const newPolygon = new window.google.maps.Polygon({
        paths: initialCoordinates.map(coord => new window.google.maps.LatLng(coord.lat, coord.lng)),
        fillColor: "#1E90FF",
        fillOpacity: 0.45,
        strokeColor: "#1E90FF",
        strokeWeight: 2,
        editable: false, // Disable editing for the initial polygon
      });

      const logCoordinates = (shape: google.maps.Polygon) => {
        const path = shape.getPath();

        const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));

        onPolygonComplete(coordinates);
        setPolygonCoordinates(coordinates);
      };

      const fitPolygonToBounds = (map: google.maps.Map, polygon: google.maps.Polygon) => {
        const bounds = new window.google.maps.LatLngBounds();
        const path = polygon.getPath();

        path.forEach((latLng: google.maps.LatLng) => {
          bounds.extend(latLng);
        });

        map.fitBounds(bounds);  // Adjust the map view to fit the polygon
      };


      if (drawingManagerRef.current?.getMap()) {
        newPolygon.setMap(drawingManagerRef.current.getMap());
        polygonRef.current = newPolygon;

        google.maps.event.addListener(newPolygon.getPath(), 'set_at', () => logCoordinates(newPolygon));
        google.maps.event.addListener(newPolygon.getPath(), 'insert_at', () => logCoordinates(newPolygon));
        google.maps.event.addListener(newPolygon.getPath(), 'remove_at', () => logCoordinates(newPolygon));

        // Adjust map view to fit the initial polygon
        fitPolygonToBounds(drawingManagerRef.current.getMap()!, newPolygon);
      }
    }
  }, [initialCoordinates, onPolygonComplete, setPolygonCoordinates]);

  return (
    <div>
      <div id="map" ref={mapRef} style={{ height: '50vh', width: '100%' }}></div>
    </div>
  );
};

export default PolygonDrawingMap;
