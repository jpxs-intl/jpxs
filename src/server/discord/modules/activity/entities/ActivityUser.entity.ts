import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { ActivityUpdate } from "./ActivityUpdate.entity";

@Entity()
export class ActivityUser {
    @PrimaryKey()
    id: string;

    @Property()
    username: string;

    @OneToMany(() => ActivityUpdate, update => update.user)
    updates = new Collection<ActivityUpdate>(this);

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }
}
