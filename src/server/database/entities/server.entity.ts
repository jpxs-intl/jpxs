import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";

@Entity()
export class Server {
  @PrimaryKey()
  id: string = cuid();

  @Property()
  address!: string;

  @Property()
  port!: number;

  @Property({
    columnType: "bigint",
  })
  identifier!: number;

  @Property()
  type!: number;

  @Property()
  isOnline!: boolean;

  @Property({
    type: "text",
    nullable: true,
  })
  description?: string;

  @Property({
    nullable: true,
  })
  icon!: string;

  @Property({
    nullable: true,
  })
  link!: string;

  @Property({
    type: "json",
    nullable: true,
  })
  bans: {
    name: string;
    subRosaId: number;
  }[] = [];
  
  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
