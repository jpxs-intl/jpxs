import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import { Ip } from "../entities/ip.entity.js";
import { Player } from "../entities/player.entity.js";

@Entity()
export class IpUse {

    @PrimaryKey()
    id: string = Id.get()

    @ManyToOne({
        entity: () => Ip,
    })
    ip!: Ip;

    @ManyToOne({
        entity: () => Player,
    })
    user!: Player;

    @Property()
    date: Date = new Date();

}
