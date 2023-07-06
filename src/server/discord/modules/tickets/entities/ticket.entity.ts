import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export default class Ticket {

    @PrimaryKey({
        autoincrement: true
    })
    public id!: number;

    @Property()
    public userId!: string;

    @Property()
    public channelId!: string;

    @Property()
    public closed!: boolean;

}