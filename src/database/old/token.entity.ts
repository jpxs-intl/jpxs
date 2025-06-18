import { Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import { Player } from "../entities/player.entity.js";

@Entity()
export class Token {

    @PrimaryKey()
    id: string = Id.get();

    @Property()
    token!: string;

    @Property()
    refreshToken!: string;

    @Property()
    expiresAt!: Date;

    @OneToOne(() => Player)
    user!: Player;

}