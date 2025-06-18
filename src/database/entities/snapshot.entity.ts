import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { Server } from "./server.entity.js";
import Id from "../../utils/id.js";

@Entity()
export class Snapshot {

    @PrimaryKey()
    id: string = Id.get();

    @ManyToOne(() => Server)
    server!: Rel<Server>;

    @Property()
    name!: string;

    @Property()
    playerCount: number = 0;

    @Property()
    maxPlayers: number = 0;

    @Property()
    timestamp: Date = new Date();

}
