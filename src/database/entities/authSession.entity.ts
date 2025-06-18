import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { AuthUser } from "./authUser.entity.js";

@Entity()
export class AuthSession {

    @PrimaryKey()
    id: string = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    @ManyToOne()
    user!: AuthUser;

    @Property()
    lastUsed: Date = new Date();

}