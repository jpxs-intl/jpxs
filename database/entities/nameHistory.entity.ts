import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import cuid from "cuid";

@Entity()
export class NameHistory {
    @PrimaryKey()
    id: string = cuid();

    @ManyToOne({
        entity: () => User,
    })
    player!: User;

    @Property()
    date: Date = new Date();

    @Property()
    name: string = "";

    constructor(name: string, player: User) {
        this.name = name;
        this.player = player;
        this.date = new Date();
    }
}