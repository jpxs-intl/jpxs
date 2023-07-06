import Database from "../../database";
import { config } from "dotenv";
import { Ip } from "../../database/entities/ip.entity";
import Logger from "../../utils/logger";
import VPNCheck from "../data/vpnCheck";

config();

const limit = 500;

const db = new Database(async () => {

    const ips = (await db.getEntityManager().find(Ip, {})).filter((i) => (i.latitude === 0 && i.longitude === 0) || i.country.length == 0).splice(0, limit);

    Logger.log("IPUpdate", `Found ${ips.length} ips with no location data`);

    for (const ip of ips) {
        const ipData = await VPNCheck.check(ip.ip);
        ip.latitude = parseFloat(ipData.location.latitude);
        ip.longitude = parseFloat(ipData.location.longitude);
        ip.country = ipData.location.country;
        ip.countryCode = ipData.location.country_code;
        ip.timeZone = ipData.location.time_zone;
        ip.isProxy = ipData.security.proxy;
        ip.isVpn = ipData.security.vpn;
        await db.getEntityManager().persistAndFlush(ip);

        Logger.log("IPUpdate",`Updated ${ip.ip} with location data`);
    }

    Logger.log("IPUpdate", "Finished updating ips");
    
    process.exit(0);
});
