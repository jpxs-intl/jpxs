import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { Player } from "./player.entity.js";
import { BaseEntity } from "../base/base.entity.js";

@Entity()
export class NameHistory extends BaseEntity {

    @ManyToOne()
    player: Rel<Player>;

    @Property()
    name: string = "";

    constructor(name: string, player: Player) {
        super()
        this.name = name;
        this.player = player;
    }
}
