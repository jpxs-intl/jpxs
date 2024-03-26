import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { User } from "./user.entity";
import { Server } from "./server.entity";

@Entity()
export default class PlayerStatus {
  @PrimaryKey()
  id: string = cuid();

  @ManyToOne({
    entity: () => User,
  })
  user!: User;

  @ManyToOne({
    entity: () => Server,
  })
  server!: Server;

  @Property()
  team!: number;

  @Property()
  corp!: number;

  @Property()
  money!: number;

  @Property()
  timestamp: Date = new Date();

  constructor(data: { user: User; server: Server; team: number; corp: number; money: number }) {
    this.user = data.user;
    this.server = data.server;
    this.team = data.team;
    this.corp = data.corp;
    this.money = data.money;
  }
}
