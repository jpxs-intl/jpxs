import { Collection, Entity, EntityRepositoryType, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { NameHistory } from "./nameHistory.entity.js";
import { AvatarHistory } from "./avatarHistory.entity.js";
import { Ip } from "./ip.entity.js";
import { PlayerRepository } from "../repositories/player.repository.js";

@Entity({ repository: () => PlayerRepository })
export class Player {

  [EntityRepositoryType]?: PlayerRepository;

  @PrimaryKey()
  phoneNumber!: number;

  @Property({
    nullable: true,
  })
  steamId?: string;

  @Property({
    nullable: true,
  })
  discordId?: string;

  @Property()
  subRosaId!: number;

  @OneToMany("NameHistory", "player")
  nameHistory = new Collection<NameHistory>(this);

  @OneToMany("AvatarHistory", "player")
  avatarHistory = new Collection<AvatarHistory>(this);

  @ManyToMany(() => Ip, ip => ip.players, {
    mappedBy: "players",
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
    return this.nameHistory.getItems().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.name;
  }

  constructor(data: { phoneNumer: number; description?: string; steamId?: string; subRosaId: number }) {
    this.phoneNumber = data.phoneNumer;
    this.steamId = data.steamId;
    this.subRosaId = data.subRosaId;

    this.lastSeen = new Date();
    this.firstSeen = new Date();

    return this;
  }
}
