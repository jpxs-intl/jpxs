import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { Player } from "./player.entity.js";
import { Server } from "./server.entity.js";
import Id from "../../utils/id.js";

@Entity()
export class GameSession {

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
    startedAt = new Date();

    @Property({
        nullable: true,
    })
    endedAt?: Date;

    constructor(player: Player, server: Rel<Server>) {
        this.player = player;
        this.server = server;
    }

    public end() {
        this.endedAt = new Date();
    }
}