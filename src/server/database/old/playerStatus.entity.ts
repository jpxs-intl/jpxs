import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from '../../../utils/id.js';
import { Player } from "../entities/player.entity.js";
import { Server } from "../entities/server.entity.js";

@Entity()
export default class PlayerStatus {
  @PrimaryKey()
  id: string = Id.get()

  @ManyToOne({
    entity: () => Player,
  })
  user!: Player;

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

  constructor(data: { user: Player; server: Server; team: number; corp: number; money: number }) {
    this.user = data.user;
    this.server = data.server;
    this.team = data.team;
    this.corp = data.corp;
    this.money = data.money;
  }
}
