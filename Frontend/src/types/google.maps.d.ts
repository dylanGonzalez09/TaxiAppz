declare namespace google.maps {
  type MapOptions = any;
  type DirectionsRequest = any;
  type DirectionsResult = any;
  type LatLngLiteral = { lat: number; lng: number };

  class Map {
    [key: string]: any;
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: any): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: any): void;
  }

  class Polygon {
    [key: string]: any;
    constructor(opts?: any);
    setMap(map: any): void;
    setEditable(editable: boolean): void;
    getPath(): any;
  }

  class Marker {
    [key: string]: any;
    constructor(opts?: any);
    setMap(map: any): void;
    setPosition(position: any): void;
  }

  class DirectionsRenderer {
    [key: string]: any;
    constructor(opts?: any);
    setDirections(result: any): void;
    setMap(map: any): void;
  }

  class DirectionsService {
    [key: string]: any;
    route(request: any, callback: any): void;
  }

  class LatLng {
    [key: string]: any;
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    [key: string]: any;
    extend(point: any): void;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  namespace drawing {
    type DrawingManager = any;
    type OverlayCompleteEvent = any;
    const OverlayType: any;
  }

  namespace places {
    type PlaceResult = any;
    type AutocompletePrediction = any;
    const PlacesServiceStatus: any;

    class AutocompleteService {
      getPlacePredictions(request: any, callback: any): void;
    }

    class PlacesService {
      constructor(attrContainer: any);
      getDetails(request: any, callback: any): void;
    }
  }

  const geometry: any;
  const event: any;
  const TravelMode: any;
  const DirectionsStatus: any;
}

declare const google: {
  maps: typeof google.maps;
};
