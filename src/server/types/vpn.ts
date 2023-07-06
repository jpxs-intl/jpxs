export interface RequiredIpData {
    security: {
      vpn: boolean;
      proxy: boolean;
    };
    location: {
      latitude: string;
      longitude: string;
      country: string;
      country_code: string;
      time_zone: string;
    };
  };