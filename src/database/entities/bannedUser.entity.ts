import { Entity, Property, PrimaryKey } from "@mikro-orm/core";

@Entity()
export class BannedUser {

    @PrimaryKey()
    phoneNumber!: number;

    @Property()
    reason!: string;

    @Property()
    createdAt = new Date();

    constructor(phoneNumber: number, reason: string) {
        this.phoneNumber = phoneNumber;
        this.reason = reason;
    }
    
}
