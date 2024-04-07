import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../../utils/id.js";
import { Player } from "./player.entity.js";

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

}
