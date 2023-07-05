import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { User } from "./user.entity";
import { Server } from "./server.entity";

@Entity()
export class Ban {
  @PrimaryKey()
  id: string = cuid();

  @Property()
  isIpBan: boolean = false;

  @Property()
  isGlobalBan: boolean = false;

  @Property()
  reason: string = "";

  @ManyToOne({
    entity: () => User,
    inversedBy: "bans",
  })
  user!: User;

  @ManyToOne({
    entity: () => Server,
  })
  server!: Server;

  @Property()
  createdBy!: User;

  @Property()
  createdAt: Date = new Date();

  @Property()
  expiresAt: Date = new Date();

  @Property()
  isPermanent: boolean = false;

  get isExpired(): boolean {
    return this.isPermanent && this.expiresAt.getTime() < Date.now();
  }
}
