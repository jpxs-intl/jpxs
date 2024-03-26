import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity()
export class AltIgnore {
    @PrimaryKey()
    phoneNumber: number;

    constructor(phoneNumber: number) {
        this.phoneNumber = phoneNumber;
    }
}
