import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { Ip } from "./ip.entity";
import { User } from "./user.entity";

@Entity()
export class IpUse {

    @PrimaryKey()
    id: string = cuid()

    @ManyToOne({
        entity: () => Ip,
    })
    ip!: Ip;

    @ManyToOne({
        entity: () => User,
    })
    user!: User;

    @Property()
    date: Date = new Date();

}
