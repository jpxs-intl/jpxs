import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Avatar } from "./avatar.entity";
import { User } from "./user.entity";
import Id from "../../../utils/id";

@Entity()
export class AvatarHistory {
  @PrimaryKey()
  id: string = Id.get();

  @ManyToOne({
    entity: () => Avatar,
  })
  avatar!: Avatar;

  @ManyToOne({
    entity: () => User,
  })
  player!: User;

  @Property()
  date: Date = new Date();

  constructor(avatar: Avatar, player: User) {
    this.avatar = avatar;
    this.player = player;
  }
}
