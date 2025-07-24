import "dotenv/config.js";
import Database from "../database/index.js";
import loadCsvFile from "./util/csvUtil.js";
import Core from "../server/core.js";
import { Player } from "../database/entities/player.entity.js";
import { writeFileSync } from "fs";


(async () => {

    await Core.start({
        dry: true
    })

    const ips = loadCsvFile<["id", "ip", "created_at", "last_used", "latitude", "longitude", "is_vpn", "is_proxy", "country", "country_code", "time_zone"]>("src/scripts/data/ip.csv");
    const ipUsers = loadCsvFile<["ip_id", "user_phone_number"]>("src/scripts/data/ip_users.csv");

    // writeFileSync("src/scripts/data/ip.json", JSON.stringify(ips, null, 2));

    const existingPlayers = await Core.services.player.findAll({
        populate: ["ips"]
    });

    const existingIps = await Core.services.ip.findAll();

    const ipEntries = [];

    for (const ip of ips) {

        const playerPhoneNumbers = ipUsers
            .filter(u => u.ip_id === ip.id)
            .map(u => parseInt(u.user_phone_number));

        const players = existingPlayers.filter(p => playerPhoneNumbers.includes(p.phoneNumber));

        const newIp = Core.services.ip.create({
            ip: ip.ip,
            createdAt: new Date(ip.created_at),
            lastUsed: new Date(ip.last_used),
            latitude: parseFloat(ip.latitude),
            longitude: parseFloat(ip.longitude),
            isVpn: ip.is_vpn === "1",
            isProxy: ip.is_proxy === "1",
            country: ip.country,
            countryCode: ip.country_code,
            timeZone: ip.time_zone,
        });

        newIp.players.add(players);

        ipEntries.push(newIp);
    }

    Core.services.em.persistAndFlush(ipEntries);

})()