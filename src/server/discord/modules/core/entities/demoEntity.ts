import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity()
export class DemoEntity {

    @PrimaryKey()
    id!: number;

}