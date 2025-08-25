import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { User } from "./user.entity.js";

@Entity()
export class AuthSession {

    @PrimaryKey()
    id: string = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    @ManyToOne()
    user!: Rel<User>;

    @Property()
    lastUsed: Date = new Date();

}