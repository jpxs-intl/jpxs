import { Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../../utils/id";
import { User } from "./user.entity";

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

    @OneToOne(() => User)
    user!: User;

}