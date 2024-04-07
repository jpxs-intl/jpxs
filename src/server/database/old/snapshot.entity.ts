import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Server } from '../entities/server.entity.js';
import Id from '../../../utils/id.js';

@Entity()
export class Snapshot {

    @PrimaryKey()
    id: string = Id.get();

    @Property()
    latency!: number;

    @Property()
    name!: string;

    @Property()
    version!: number;

    @Property()
    build!: string;

    @Property()
    clientCompatability!: number;

    @Property()
    passworded!: boolean;

    @Property()
    gameType!: number;

    @Property()
    players!: number;

    @Property()
    maxPlayers!: number;

    @ManyToOne()
    server!: Server;

    @Property()
    timestamp: Date = new Date();

}