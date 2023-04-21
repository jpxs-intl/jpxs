import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { Avatar } from "./avatar.entity";
import { User } from "./user.entity";

@Entity()
export class AvatarHistory {
  @PrimaryKey()
  id: string = cuid();

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
}
