import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Player } from "./player.entity.js";
import { Server } from "./server.entity.js";

@Entity()
export class Session {

    @PrimaryKey()
    id!: string;

    @ManyToOne({
        entity: () => Player,
    })
    player!: Player;

    @ManyToOne({
        entity: () => Server,
    })
    server!: Server;

    @Property()
    startedAt = new Date();

    @Property({
        nullable: true,
    })
    endedAt?: Date;

    constructor(id: string, player: Player, server: Server) {
        this.id = id;
        this.player = player;
        this.server = server;
    }

    public end() {
        this.endedAt = new Date();
    }
}