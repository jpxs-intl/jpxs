import { Collection, Entity, Index, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { NameHistory } from "./nameHistory.entity";
import { AvatarHistory } from "./avatarHistory.entity";
import { Ip } from "./ip.entity";

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

  @OneToMany(() => NameHistory, (nameHistory) => nameHistory.player)
  nameHistory: Collection<NameHistory> = new Collection<NameHistory>(this);

  @OneToMany(() => AvatarHistory, (avatarHistory) => avatarHistory.player)
  avatarHistory: Collection<AvatarHistory> = new Collection<AvatarHistory>(this);

  @ManyToMany({
    entity: () => Ip,
  })
  ips: Collection<Ip> = new Collection<Ip>(this);

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

    this.lastSeen = new Date();
    this.firstSeen = new Date();

    return this;
  }
}
