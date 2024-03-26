import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import { Server } from "./server.entity";
import { PunishmentType } from "../../types/punishmentType";

@Entity()
export class Punishment {
  @PrimaryKey({
    type: "integer",
    autoincrement: true,
  })
  id!: number;

  @Property({
    type: "int",
  })
  type!: PunishmentType;

  @Property({
    type: "text",
  })
  reason: string = "";

  @Property()
  user!: number; // phone number

  @ManyToOne({
    entity: () => Server,
  })
  server!: Server;

  /**
   * The user who created the punishment.
   */
  @Property()
  createdBy!: User;

  @Property()
  createdAt: Date = new Date();

  /**
   * If the punishment is permanent, this will be set to epoch time.
   */
  @Property()
  expiresAt!: Date;

  get isPermanent(): boolean {
    return this.expiresAt.getTime() === 0;
  }

  get isExpired(): boolean {
    return this.isPermanent && this.expiresAt.getTime() < Date.now();
  }
}
