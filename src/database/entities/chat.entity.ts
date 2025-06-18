import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import { Player } from "./player.entity.js";
import { Server } from "./server.entity.js";

@Entity()
export class Chat {
    @PrimaryKey()
    id: string = Id.get()

    @ManyToOne({
        entity: () => Player,
    })
    player!: Player;

    @ManyToOne({
        entity: () => Server,
    })
    server!: Server;

    @Property()
    timestamp = new Date();

    @Property()
    message!: string;

    @Property()
    volume = 1;

    constructor(player: Player, server: Server, message: string, volume: number) {
        this.player = player;
        this.server = server;
        this.message = message;
        this.volume = volume;
    }
}
