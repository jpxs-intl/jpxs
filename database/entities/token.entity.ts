import { Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { User } from "./user.entity";

@Entity()
export class Token {

    @PrimaryKey()
    id: string = cuid();

    @Property()
    token!: string;

    @Property()
    refreshToken!: string;

    @Property()
    expiresAt!: Date;

    @OneToOne(() => User)
    user!: User;

}