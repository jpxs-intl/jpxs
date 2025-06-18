import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import { Player } from "./player.entity.js";
import { Server } from "./server.entity.js";

@Entity()
export class Finance {
    @PrimaryKey()
    id: string = Id.get()

    @ManyToOne({
        entity: () => Player,
    })
    player!: Player;

    @ManyToOne({
        entity: () => Server,
    })
    server!: Rel<Server>;

    @Property()
    timestamp = new Date();

    @Property()
    money!: number;

    @Property()
    corporateRating!: number;

    constructor(player: Player, server: Rel<Server>, money: number, corporateRating: number) {
        this.player = player;
        this.server = server;
        this.money = money;
        this.corporateRating = corporateRating;
    }
}
