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

  public static getOXSAvatarUrl(id: string, options: {
    rotate?: boolean;
    antiAliasing?: boolean;
    body?: boolean;
    class?: 0 | 1 | 2 | 3,
    team?: "gol" | "mon" | "oxs" | "nex" | "ptc" | "meg",
    equipSuit?: 0 | 1 | 2 | 3,
    equipNeck?: 0 | 1 | 2,
    backgroundColor?: string | number,
  }): string {
    const numbers = id.split("").map((n) => parseInt(n));
    const url = new URL("https://oxs.international/avatar");

    url.searchParams.set("gender", numbers[0] == 1 ? "m" : "f");
    url.searchParams.set("head", numbers[1].toString());
    url.searchParams.set("eyeColor", numbers[2].toString());
    url.searchParams.set("hairColor", numbers[4].toString());
    url.searchParams.set("skinColor", numbers[5].toString());
    url.searchParams.set("hair", numbers[3].toString());

    if (options.rotate) url.searchParams.set("rotate", "true");
    if (options.antiAliasing == false) url.searchParams.set("antiAliasing", "false");
    if (options.body == false) url.searchParams.set("body", "false");
    if (options.class) url.searchParams.set("class", options.class.toString());
    if (options.team) url.searchParams.set("team", options.team);
    if (options.equipSuit) url.searchParams.set("equipSuit", options.equipSuit.toString());
    if (options.equipNeck) url.searchParams.set("equipNeck", options.equipNeck.toString());
    if (options.backgroundColor) url.searchParams.set("backgroundColor", typeof options.backgroundColor == "string" ? options.backgroundColor : options.backgroundColor.toString());

    return url.toString();
  }
}
