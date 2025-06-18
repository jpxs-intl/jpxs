import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Player } from "../entities/player.entity.js";
import { Server } from "../entities/server.entity.js";
import { PunishmentType } from "../../server/types/punishmentType.js";

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
  createdBy!: Player;

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
