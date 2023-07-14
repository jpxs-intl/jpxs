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

  @Property({
    nullable: true,
  })
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

  @Property({
    default: 0,
  })
  supporterLevel = 0;

  @Property({
    nullable: true,
    default: null,
  })
  source?: string;

  async getName() {
    if (!this.nameHistory.isInitialized()) await this.nameHistory.init();
    return this.nameHistory.getItems().sort((a, b) => b.date.getTime() - a.date.getTime())[0].name;
  }

  constructor(data: { phoneNumer: number; description?: string; steamId?: string; gameId: number }) {
    this.phoneNumber = data.phoneNumer;
    this.description = data.description || "";
    this.steamId = data.steamId;
    this.gameId = data.gameId;

    this.lastSeen = new Date();
    this.firstSeen = new Date();

    return this;
  }
}
