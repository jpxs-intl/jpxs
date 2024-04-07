import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../base/base.entity.js";

@Entity()
export class Avatar extends BaseEntity {

  @Property()
  gender: number

  @Property()
  skinColor: number

  @Property()
  hairColor: number

  @Property()
  hair: number

  @Property()
  eyeColor: number

  @Property()
  head: number

  constructor(data: {
    gender: number
    skinColor: number
    hairColor: number
    hair: number
    eyeColor: number
    head: number
  }) {
    super()
    this.gender = data.gender
    this.skinColor = data.skinColor
    this.hairColor = data.hairColor
    this.hair = data.hair
    this.eyeColor = data.eyeColor
    this.head = data.head
  }

  public static getOXSAvatarUrl(avatar: Avatar, options: {
    embed?: boolean;
    rotate?: boolean;
    antiAliasing?: boolean;
    body?: boolean;
    class?: 0 | 1 | 2 | 3,
    team?: "gol" | "mon" | "oxs" | "nex" | "ptc" | "meg",
    equipSuit?: 0 | 1 | 2 | 3,
    equipNeck?: 0 | 1 | 2,
    backgroundColor?: string | number,
  }): string {
    const url = new URL("https://oxs.international/avatar");

    const hashStrings = new Map<string, string>();

    hashStrings.set("gender", avatar.gender == 1 ? "m" : "f");
    hashStrings.set("head", (avatar.head + 1).toString());
    hashStrings.set("eyeColor", (avatar.eyeColor + 1).toString());
    hashStrings.set("hairColor", (avatar.hairColor + 1).toString());
    hashStrings.set("skinColor", (avatar.skinColor + 1).toString());
    hashStrings.set("hair", (avatar.hair + 1).toString());

    if (options.rotate) hashStrings.set("rotate", "true");
    if (options.antiAliasing == false) hashStrings.set("antiAliasing", "false");
    if (options.body == false) hashStrings.set("body", "false");
    if (options.class) hashStrings.set("class", options.class.toString());
    if (options.team) hashStrings.set("team", options.team);
    if (options.equipSuit) hashStrings.set("equipSuit", options.equipSuit.toString());
    if (options.equipNeck) hashStrings.set("equipNeck", options.equipNeck.toString());
    if (options.backgroundColor) hashStrings.set("backgroundColor", typeof options.backgroundColor == "string" ? options.backgroundColor : options.backgroundColor.toString());
    if (options.embed) hashStrings.set("embed", "true");

    url.hash = Array.from(hashStrings.entries()).map(([key, value]) => `${key}=${value}`).join(";");

    return url.toString();
  }
}
