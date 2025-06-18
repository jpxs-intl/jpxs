import { BaseEntity } from "../base/base.entity.js";
import { Entity, ManyToOne } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { Avatar } from "./avatar.entity.js";
import { Player } from "./player.entity.js";

@Entity()
export class AvatarHistory extends BaseEntity {
  @ManyToOne(() => Avatar, { fieldName: "avatar_id" })
  avatar!: Avatar;

  @ManyToOne()
  player!: Rel<Player>;

  constructor(avatar: Avatar, player: Player) {
    super();
    this.avatar = avatar;
    this.player = player;
  }
}
