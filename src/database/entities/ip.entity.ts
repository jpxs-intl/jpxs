import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import { Player } from "./player.entity.js";
import VPNCheck from "../../utils/vpn.js";

@Entity()
export class Ip {

    @PrimaryKey()
    id: string = Id.get()

    @Property()
    ip: string = ""

    @Property()
    createdAt: Date = new Date()

    @Property()
    lastUsed: Date = new Date(0)

    @Property({
        default: 0,
        type: "float"
    })
    latitude: number = 0

    @Property({
        default: 0,
        type: "float"
    })
    longitude: number = 0

    @Property()
    isVpn: boolean = false

    @Property()
    isProxy: boolean = false

    @Property()
    country: string = ""

    @Property()
    countryCode: string = ""

    @Property()
    timeZone: string = ""

    @ManyToMany({
        entity: () => Player,
        inversedBy: "ips",
    })
    players = new Collection<Player>(this)

    public static async createFromIpAddress(ip: string, player: Player): Promise<Ip | undefined> {
        const vpnResult = await VPNCheck.check(ip).catch(() => {
            return; // If VPN check fails, assume it's not a VPN
        });

        if (!vpnResult) {
            return; // If VPN check failed, do not create an entry
        }

        const ipEntry = new Ip();
        ipEntry.ip = ip;
        ipEntry.createdAt = new Date();
        ipEntry.lastUsed = new Date();
        ipEntry.latitude = parseFloat(vpnResult.location.latitude);
        ipEntry.longitude = parseFloat(vpnResult.location.longitude);
        ipEntry.isVpn = vpnResult.security.vpn;
        ipEntry.isProxy = vpnResult.security.proxy;
        ipEntry.country = vpnResult.location.country;
        ipEntry.countryCode = vpnResult.location.country_code;
        ipEntry.timeZone = vpnResult.location.time_zone;
        ipEntry.players.add(player);

        return ipEntry;
    }

}
