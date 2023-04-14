import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Avatar } from "./avatar.entity";
import Logger from "../../utils/logger";

@Entity()
export class User {
  @PrimaryKey()
  phoneNumber!: number;

  @Property({
    type: "text",
  })
  description: string = "";

  @Property()
  steamId?: string;

  @Property({
    nullable: true,
  })
  discordId?: string;

  @Property()
  gameId!: number;

  @Property({
    type: "json",
  })
  nameHistory: {
    name: string;
    date: Date;
  }[] = [];

  @Property({
    type: "json",
  })
  avatarHistory: {
    avatar: Avatar;
    date: Date;
  }[] = [];

  @Property({
    type: "json",
  })
  seenIps: {
    ip: string;
    lastSeen: Date;
  }[] = [];

  @Property()
  lastSeen = new Date();

  @Property()
  firstSeen = new Date();

  get avatar() {
    return this.avatarHistory[this.avatarHistory.length - 1].avatar;
  }

  get name() {
    return this.nameHistory[this.nameHistory.length - 1].name;
  }

  get lastIp() {
    return this.seenIps[this.seenIps.length - 1].ip;
  }

  constructor(data: {
    phoneNumer: number;
    description?: string;
    steamId?: string;
    gameId: number;
    name: string;
    hashedIp?: string;
    avatar?: {
      sex: number;
      head: number;
      eyes: number;
      hair: number;
      hairColor: number;
      skin: number;
    };
  }) {
    this.phoneNumber = data.phoneNumer;
    this.description = data.description || "";
    this.steamId = data.steamId;
    this.gameId = data.gameId;
    this.nameHistory.push({
      name: data.name,
      date: new Date(),
    });

    if (data.avatar) {
      this.catchAvatar(new Avatar(data.avatar));
    }

    if (data.hashedIp)
      this.seenIps.push({
        ip: data.hashedIp,
        lastSeen: new Date(),
      });

    this.lastSeen = new Date();
    this.firstSeen = new Date();

    return this;
  }

  public catchName(name: string) {
    if (this.name === name) return;
    this.nameHistory.push({
      name,
      date: new Date(),
    });
  }

  public catchAvatar(avatar: Avatar) {
    Logger.info("User.entity", `${avatar.id} => ${this.avatar.id}`);
    if (this.avatar.id === avatar.id) return;
    this.avatarHistory.push({
      avatar,
      date: new Date(),
    });
  }

  public catchIp(ip: string) {
    if (this.lastIp === ip) return;
    this.seenIps.push({
      ip,
      lastSeen: new Date(),
    });
  }
}
