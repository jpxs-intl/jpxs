import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import cuid from 'cuid';
import { Server } from './server.entity';

@Entity()
export class Snapshot {

    @PrimaryKey()
    id: string = cuid();

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