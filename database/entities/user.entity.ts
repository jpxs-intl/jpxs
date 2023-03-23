import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Avatar } from "./avatar.entity";

@Entity()
export class User {
  @PrimaryKey()
  phoneNumber!: number;

  @Property({
    type: "text",
  })
  description!: string;

  @Property()
  steamId!: string;

  @Property({
    type: "json",
  })
  nameHistory!: {
    name: string;
    date: Date;
  }[];

  @Property({
    type: "json",
  })
  avatarHistory!: {
    avatar: Avatar;
    date: Date;
  }[];

  @Property({
    type: "json",
  })
  seenIps!: {
    ip: string;
    lastSeen: Date;
  }[];

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
}
