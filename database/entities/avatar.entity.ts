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
}
