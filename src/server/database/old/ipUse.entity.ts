import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../../utils/id";
import { Ip } from "./ip.entity";
import { User } from "./user.entity";

@Entity()
export class IpUse {

    @PrimaryKey()
    id: string = Id.get()

    @ManyToOne({
        entity: () => Ip,
    })
    ip!: Ip;

    @ManyToOne({
        entity: () => User,
    })
    user!: User;

    @Property()
    date: Date = new Date();

}
