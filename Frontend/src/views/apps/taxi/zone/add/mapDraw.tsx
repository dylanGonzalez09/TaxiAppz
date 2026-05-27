/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { getGoogleMapsApiKey } from '@configs/getGoogleMapsApiKey';

declare global {
  interface Window {
    google: any;
  }
}

const PRIMARY_ZONE_DRAW: google.maps.PolygonOptions = {
  fillColor: '#1E90FF',
  fillOpacity: 0.45,
  strokeColor: '#1E90FF',
  strokeWeight: 2,
  editable: true,
  draggable: true,
  zIndex: 2,
};

const SECONDARY_ZONE_DISPLAY: google.maps.PolygonOptions = {
  fillColor: '#FF6F00',
  fillOpacity: 0.42,
  strokeColor: '#BF360C',
  strokeWeight: 3,
  editable: false,
  draggable: false,
  clickable: false,
  zIndex: 5,
};

const PARENT_ZONE_OUTLINE: google.maps.PolygonOptions = {
  fillColor: '#2E7D32',
  fillOpacity: 0.1,
  strokeColor: '#1B5E20',
  strokeWeight: 3,
  editable: false,
  draggable: false,
  clickable: false,
  zIndex: 1,
};

/** Other existing secondary zones under the same primary (read-only, between primary green and current orange). */
const PEER_SECONDARY_OUTLINE: google.maps.PolygonOptions = {
  fillColor: '#5E35B1',
  fillOpacity: 0.22,
  strokeColor: '#4527A0',
  strokeWeight: 2,
  editable: false,
  draggable: false,
  clickable: false,
  zIndex: 3,
};

interface PolygonDrawingMapProps {
  setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>;
  setPolygonCoordinates: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }[]>>;
  setSelectedShape: React.Dispatch<React.SetStateAction<google.maps.Polygon | null>>;
  onPolygonComplete: (coordinates: { lat: number; lng: number }[]) => void;
  initialCoordinates: { lat: number; lng: number }[];
  referencePolygonCoordinates?: { lat: number; lng: number }[];
  referencePolygonKey?: string;
  zonesDisplayOnly?: boolean;

  /** When true, do not use the solo PRIMARY (blue) painter — secondary zones wait for parent outline. */
  suppressSoloPrimaryOverlay?: boolean;

  /** Other secondaries under the selected primary (from API `secondaryZones`). */
  peerSecondaryZones?: { zoneId: string; coordinates: { lat: number; lng: number }[] }[];

  /** On edit, omit this zone so it is only shown as the active orange polygon. */
  excludePeerZoneId?: string;
}

const PolygonDrawingMap: React.FC<PolygonDrawingMapProps> = ({
  setMap,
  setPolygonCoordinates,
  setSelectedShape,
  onPolygonComplete,
  initialCoordinates,
  referencePolygonCoordinates = [],
  referencePolygonKey = '',
  zonesDisplayOnly = false,
  suppressSoloPrimaryOverlay = false,
  peerSecondaryZones = [],
  excludePeerZoneId,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const referencePolygonRef = useRef<google.maps.Polygon | null>(null);
  const zonePolygonRef = useRef<google.maps.Polygon | null>(null);
  const peerPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const innerZoneModeRef = useRef(false);
  const prevReferenceKeyRef = useRef<string | null>(null);
  const hadParentBoundaryRef = useRef(false);
  const [initialized, setInitialized] = useState(false);

  const hasParentBoundary =
    Array.isArray(referencePolygonCoordinates) && referencePolygonCoordinates.length >= 3;

  innerZoneModeRef.current = hasParentBoundary;

  const refPathKey = useMemo(
    () => JSON.stringify(referencePolygonCoordinates ?? []),
    [referencePolygonCoordinates]
  );

  const zonePathKey = useMemo(() => JSON.stringify(initialCoordinates ?? []), [initialCoordinates]);

  const peerDisplayKey = useMemo(() => {
    const exclude = (excludePeerZoneId ?? '').trim();

    const list = (peerSecondaryZones ?? [])
      .filter(
        p =>
          (p.coordinates?.length ?? 0) >= 3 &&
          (!exclude || String(p.zoneId) !== exclude)
      )
      .map(p => ({ id: String(p.zoneId), c: p.coordinates }));

    
return JSON.stringify(list);
  }, [peerSecondaryZones, excludePeerZoneId]);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const key = await getGoogleMapsApiKey();

        const initialize = () => {
          if (mapRef.current && window.google && !initialized) {
            const mapOptions: google.maps.MapOptions = {
              zoom: 12,
              center: new window.google.maps.LatLng(
                initialCoordinates.length > 0 ? initialCoordinates[0].lat : 11.041491541344278,
                initialCoordinates.length > 0 ? initialCoordinates[0].lng : 76.90004215249024
              ),
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            };

            const newMap = new window.google.maps.Map(mapRef.current, mapOptions);

            mapInstanceRef.current = newMap;
            setMap(newMap);

            const drawingManagerOptions: google.maps.drawing.DrawingManagerOptions = {
              drawingControl: !zonesDisplayOnly,
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: innerZoneModeRef.current ? SECONDARY_ZONE_DISPLAY : PRIMARY_ZONE_DRAW,
            };

            const newDrawingManager = new window.google.maps.drawing.DrawingManager(drawingManagerOptions);

            newDrawingManager.setMap(newMap);
            drawingManagerRef.current = newDrawingManager;

            window.google.maps.event.addListener(
              newDrawingManager,
              'overlaycomplete',
              (e: google.maps.drawing.OverlayCompleteEvent) => {
                if (e.type !== window.google.maps.drawing.OverlayType.POLYGON) return;
                if (zonesDisplayOnly) return;

                const drawn = e.overlay as google.maps.Polygon;
                const path = drawn.getPath();

                const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
                  lat: latLng.lat(),
                  lng: latLng.lng(),
                }));

                drawn.setMap(null);
                setSelectedShape(null);
                setPolygonCoordinates(coordinates);
                onPolygonComplete(coordinates);
              }
            );

            setInitialized(true);
          }
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
  }, [setMap, setPolygonCoordinates, setSelectedShape, onPolygonComplete, initialized]);

  useEffect(() => {
    if (!drawingManagerRef.current || !window.google) return;
    drawingManagerRef.current.setOptions({
      drawingControl: !zonesDisplayOnly,
      polygonOptions: innerZoneModeRef.current ? SECONDARY_ZONE_DISPLAY : PRIMARY_ZONE_DRAW,
    });

    if (zonesDisplayOnly) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  }, [hasParentBoundary, initialized, zonesDisplayOnly]);

  useEffect(() => {
    const splitKey = (key: string) => {
      const i = key.indexOf(':');

      if (i === -1) return { level: key.trim(), primaryId: '' };
      
return { level: key.slice(0, i).trim(), primaryId: key.slice(i + 1).trim() };
    };

    if (prevReferenceKeyRef.current === null) {
      prevReferenceKeyRef.current = referencePolygonKey;
      
return;
    }

    if (prevReferenceKeyRef.current === referencePolygonKey) return;

    const prev = splitKey(prevReferenceKeyRef.current);
    const next = splitKey(referencePolygonKey);

    prevReferenceKeyRef.current = referencePolygonKey;

    if (prev.level === next.level && prev.primaryId === next.primaryId) return;
    if (prev.level === next.level && !prev.primaryId && next.primaryId) return;


    /**
     * Edit (and slow hydrate): first paint uses `:` before zoneLevel/primary load, then `SECONDARY:primaryId`.
     * That is not the user changing primary — do not wipe polygon coordinates or peers.
     */
    if (next.level === 'SECONDARY' && next.primaryId && prev.level === '' && prev.primaryId === '') {
      return;
    }

    if (zonePolygonRef.current) {
      zonePolygonRef.current.setMap(null);
      zonePolygonRef.current = null;
    }

    setSelectedShape(prevS => {
      if (prevS) prevS.setMap(null);
      
return null;
    });
    setPolygonCoordinates([]);
    onPolygonComplete([]);
  }, [referencePolygonKey, onPolygonComplete, setPolygonCoordinates, setSelectedShape]);

  /** When switching from SECONDARY (with parent outline) to PRIMARY, clear read-only overlays. */
  useEffect(() => {
    if (!initialized || !window.google) return;

    const prev = hadParentBoundaryRef.current;

    hadParentBoundaryRef.current = hasParentBoundary;

    if (prev && !hasParentBoundary) {
      if (referencePolygonRef.current) {
        referencePolygonRef.current.setMap(null);
        referencePolygonRef.current = null;
      }

      if (zonePolygonRef.current) {
        zonePolygonRef.current.setMap(null);
        zonePolygonRef.current = null;
      }

      peerPolygonsRef.current.forEach(p => p.setMap(null));
      peerPolygonsRef.current = [];
    }
  }, [initialized, hasParentBoundary]);

  /** Parent primary (green) + this zone as secondary (orange) — read-only overlays. */
  useEffect(() => {
    if (!initialized || !window.google || !hasParentBoundary) return;

    const map = mapInstanceRef.current;

    if (!map) return;

    if (referencePolygonRef.current) {
      referencePolygonRef.current.setMap(null);
      referencePolygonRef.current = null;
    }

    if (zonePolygonRef.current) {
      zonePolygonRef.current.setMap(null);
      zonePolygonRef.current = null;
    }

    peerPolygonsRef.current.forEach(p => p.setMap(null));
    peerPolygonsRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    const refPoly = new window.google.maps.Polygon({
      ...PARENT_ZONE_OUTLINE,
      paths: referencePolygonCoordinates.map(c => new window.google.maps.LatLng(c.lat, c.lng)),
      map,
    });

    referencePolygonRef.current = refPoly;
    refPoly.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));

    const excludeId = (excludePeerZoneId ?? '').trim();

    const peers = (peerSecondaryZones ?? []).filter(
      p =>
        (p.coordinates?.length ?? 0) >= 3 &&
        (!excludeId || String(p.zoneId) !== excludeId)
    );

    peers.forEach(peer => {
      const poly = new window.google.maps.Polygon({
        ...PEER_SECONDARY_OUTLINE,
        paths: peer.coordinates.map(c => new window.google.maps.LatLng(c.lat, c.lng)),
        map,
      });

      peerPolygonsRef.current.push(poly);
      peer.coordinates.forEach(c =>
        bounds.extend(new window.google.maps.LatLng(c.lat, c.lng))
      );
    });

    if (initialCoordinates.length >= 3) {
      const activeSecondaryOpts: google.maps.PolygonOptions = zonesDisplayOnly
        ? SECONDARY_ZONE_DISPLAY
        : {
            ...SECONDARY_ZONE_DISPLAY,
            editable: true,
            draggable: true,
            clickable: true,
          };

      const zonePoly = new window.google.maps.Polygon({
        ...activeSecondaryOpts,
        paths: initialCoordinates.map(c => new window.google.maps.LatLng(c.lat, c.lng)),
        map,
      });

      zonePolygonRef.current = zonePoly;
      zonePoly.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));

      if (!zonesDisplayOnly) {
        const log = () => {
          const path = zonePoly.getPath();

          const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));

          setPolygonCoordinates(coordinates);
          onPolygonComplete(coordinates);
        };

        google.maps.event.addListener(zonePoly.getPath(), 'set_at', log);
        google.maps.event.addListener(zonePoly.getPath(), 'insert_at', log);
        google.maps.event.addListener(zonePoly.getPath(), 'remove_at', log);
        google.maps.event.addListener(zonePoly, 'dragend', log);
      }
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [initialized, hasParentBoundary, refPathKey, zonePathKey, peerDisplayKey]);

  /**
   * PRIMARY zone only (no parent): one editable blue polygon.
   * Depends on point count, not full path JSON, so vertex drags do not recreate the shape.
   */
  useEffect(() => {
    if (!initialized || !window.google || hasParentBoundary || suppressSoloPrimaryOverlay) return;

    const map = mapInstanceRef.current;

    if (!map) return;

    if (initialCoordinates.length < 3) {
      if (zonePolygonRef.current) {
        zonePolygonRef.current.setMap(null);
        zonePolygonRef.current = null;
      }

      return;
    }

    if (zonePolygonRef.current) return;

    const primaryOpts: google.maps.PolygonOptions = zonesDisplayOnly
      ? {
          ...PRIMARY_ZONE_DRAW,
          editable: false,
          draggable: false,
          clickable: false,
        }
      : PRIMARY_ZONE_DRAW;

    const zonePoly = new window.google.maps.Polygon({
      ...primaryOpts,
      paths: initialCoordinates.map(c => new window.google.maps.LatLng(c.lat, c.lng)),
      map,
    });

    zonePolygonRef.current = zonePoly;

    if (!zonesDisplayOnly) {
      const log = () => {
        const path = zonePoly.getPath();

        const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));

        setPolygonCoordinates(coordinates);
        onPolygonComplete(coordinates);
      };

      google.maps.event.addListener(zonePoly.getPath(), 'set_at', log);
      google.maps.event.addListener(zonePoly.getPath(), 'insert_at', log);
      google.maps.event.addListener(zonePoly.getPath(), 'remove_at', log);
    }

    const bounds = new window.google.maps.LatLngBounds();

    zonePoly.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [
    initialized,
    hasParentBoundary,
    suppressSoloPrimaryOverlay,
    initialCoordinates.length,
    zonesDisplayOnly,
    onPolygonComplete,
    setPolygonCoordinates,
  ]);

  return (
    <div>
      <div id="map" ref={mapRef} style={{ height: '80vh', width: '100%' }}></div>
    </div>
  );
};

export default PolygonDrawingMap;
