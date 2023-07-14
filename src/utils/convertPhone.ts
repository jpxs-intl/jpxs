import { Collection } from "discord.js";
import fs from "fs";
import path from "path";

export default class ConvertPhone {
  // phone, gameid
  private static map: Collection<number, number> = new Collection<number, number>();
  private static isLoaded = false;

  private static load() {
    const buf = fs.readFileSync(path.resolve("./src/assets/data/gameid.bin"));

    for (let i = 0; i < buf.length; i += 8) {
      this.map.set(buf.readUint32LE(i + 4), buf.readUint32LE(i));
    }

    this.isLoaded = true;
  }

  public static get(phone: number) {
    if (!this.isLoaded) this.load();
    return this.map.get(phone);
  }
}
