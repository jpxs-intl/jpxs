import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Avatar {
  @PrimaryKey()
  id!: string;

  @Property()
  sex!: number;

  @Property()
  head!: number;

  @Property()
  eyes!: number;

  @Property()
  hair!: number;

  @Property()
  hairColor!: number;

  @Property()
  skin!: number;

  constructor(data: {
    sex: number;
    head: number;
    eyes: number;
    hair: number;
    hairColor: number;
    skin: number;
  }) {
    const id = Avatar.getId(data);

    this.id = id;
    this.sex = data.sex;
    this.head = data.head;
    this.eyes = data.eyes;
    this.hair = data.hair;
    this.hairColor = data.hairColor;
    this.skin = data.skin;
  }

  public static getId(data: {
    sex: number;
    head: number;
    eyes: number;
    hair: number;
    hairColor: number;
    skin: number;
  }): string {
    return `${data.sex}${data.head}${data.eyes}${data.hair}${data.hairColor}${data.skin}`;
  }

  public static getAvatar(id: string) {
    const numbers = id.split("").map((n) => parseInt(n));
    return {
      sex: numbers[0],
      head: numbers[1],
      eyes: numbers[2],
      hair: numbers[3],
      hairColor: numbers[4],
      skin: numbers[5],
    }
  }

  public static getOXSAvatarUrl(avatar: Avatar, options: {
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

    hashStrings.set("gender", avatar.sex == 1 ? "m" : "f");
    hashStrings.set("head", avatar.head.toString());
    hashStrings.set("eyeColor", avatar.eyes.toString());
    hashStrings.set("hairColor", avatar.hairColor.toString());
    hashStrings.set("skinColor", avatar.skin.toString());
    hashStrings.set("hair", avatar.hair.toString());

    if (options.rotate) hashStrings.set("rotate", "true");
    if (options.antiAliasing == false) hashStrings.set("antiAliasing", "false");
    if (options.body == false) hashStrings.set("body", "false");
    if (options.class) hashStrings.set("class", options.class.toString());
    if (options.team) hashStrings.set("team", options.team);
    if (options.equipSuit) hashStrings.set("equipSuit", options.equipSuit.toString());
    if (options.equipNeck) hashStrings.set("equipNeck", options.equipNeck.toString());
    if (options.backgroundColor) hashStrings.set("backgroundColor", typeof options.backgroundColor == "string" ? options.backgroundColor : options.backgroundColor.toString());

    url.hash = Array.from(hashStrings.entries()).map(([key, value]) => `${key}=${value}`).join(";");

    return url.toString();
  }
}
