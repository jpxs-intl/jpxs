
export enum VPNCheckErrorResults {
    NO_INPUT = -1,
    INVALID_IP = -2,
    UNROUTABLE_IP = -3,
    DB_BUSY = -4,
    BANNED_IP = -5,
    NO_CONTACT = -6,
}

export interface VPNCheckResponse {
    ip: string;
    security: Security;
    location: Location;
    network: Network;
}

export interface Network {
    network: string;
    autonomous_system_number: string;
    autonomous_system_organization: string;
}

export interface Location {
    city: string;
    region: string;
    country: string;
    continent: string;
    region_code: string;
    country_code: string;
    continent_code: string;
    latitude: string;
    longitude: string;
    time_zone: string;
    locale_code: string;
    metro_code: string;
    is_in_european_union: boolean;
}

export interface Security {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
}

export default class VPNCheck {
    public static async check(ip: string): Promise<VPNCheckResponse> {

        const res = await fetch(`https://vpnapi.io/api/${ip}?key=${process.env.VPN_API_KEY}`);
        if (res.status !== 200) {
            throw new Error("VPNCheck: Request failed");
        }
        const data = await res.json() as VPNCheckResponse & { error: string };

        if (data.error) {
            throw new Error(`VPNCheck: ${data.error}`);
        }

        return data
    }
}
