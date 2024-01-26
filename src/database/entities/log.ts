import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";

@Entity()
export class Log {
 
    @PrimaryKey()
    id: string = cuid();
    
    @Property({
        nullable: false,
    })
    serverId: string;

    @Property()
    type: string;

    @Property()
    log: string;

    @Property()
    timestamp: number = Date.now();

    constructor(serverId: string, type: string, log: string) {
        this.serverId = serverId;
        this.type = type;
        this.log = log;
    }

    public static create(serverId: string, type: string, log: string) {
        return new Log(serverId, type, log);
    }

}