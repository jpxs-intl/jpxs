export default class Util {
    public static randomString(length: number): string {
        const strings = Math.ceil(length / 16);
        let str = "";
        for (let i = 0; i < strings; i++) {
            str += Math.random().toString(36).substring(2, 15);
        }

        return str.substring(0, length);
    }

    public static ipv6ToIpv4(ip: string): string {
        const parts = ip.split(":");
        return parts[parts.length - 1];
    }

    public static stringify(obj: any): string {
        if (typeof obj == "object" && obj !== null) {
            return JSON.stringify(obj);
        }
        return obj.toString();
    }

    public static removeKeys<T>(obj: T, keys: (keyof T)[]): Partial<T> {
        const newObj = { ...obj };
        for (const key of keys) {
            delete newObj[key];
        }
        return newObj;
    }

    public static formatPhone(phone: string | number): string {
        if (typeof phone === "number") {
            phone = phone.toString();
        }
        // Remove non-numeric characters
        const cleaned = phone.replace(/\D/g, "");
        // Format as XXX-XXXX
        const match = cleaned.match(/^(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}`;
        }
        return phone; // Return original if format is not matched
    }

}
