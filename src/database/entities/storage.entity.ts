import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export default class Storage {
    @PrimaryKey({
        type: "string",
        length: 64
    })
    key: string;

    @Property({
        type: "text",
        length: 1024
    })
    value: string;

    @Property({
        nullable: true,
        type: "string",
        length: 16
    })
    token?: string

    constructor(key: string, value: string, token?: string) {
        this.key = key;
        this.value = value;
        this.token = token;
    }

}
