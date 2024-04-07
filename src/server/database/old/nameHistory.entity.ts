import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import Id from "../../../utils/id";

@Entity()
export class NameHistory {
    @PrimaryKey()
    id: string = Id.get();

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