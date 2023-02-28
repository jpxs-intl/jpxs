import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import cuid from 'cuid';

@Entity()
export class LiveServer {

    @PrimaryKey()
    id: string = cuid();

    @Property()
    address!: string;

    @Property()
    port!: number;

    @Property({
        columnType: 'bigint'
    })
    identifier!: number;

    @Property()
    type!: number;

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

    @Property()
    timestamp: Date = new Date();
    
}