import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { User } from "./user.entity";

@Entity()
export class Ip {

    @PrimaryKey()
    id: string = cuid()

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
        entity: () => User,
        inversedBy: "ips",
    })
    users: Collection<User> = new Collection<User>(this)

}
