import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../../utils/id";

@Entity()
export class Tag {
    @PrimaryKey()
    id: string = `tag-${Id.get()}`;

    @Property()
    key: string;

    @Property()
    serverId: string;

    constructor(key: string, serverId: string) {
        this.key = key;
        this.serverId = serverId;
    }
}
