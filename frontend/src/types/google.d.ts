// Google Maps API型定義
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        LatLng: any;
        Marker: any;
        Size: any;
        places: {
          PlacesService: any;
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            ERROR: string;
          };
        };
      };
    };
  }
}

export {};