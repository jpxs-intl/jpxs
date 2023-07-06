import fs from "fs";
import path from "path";

export default class Emoji {
  public static db: {
    emoji: string;
    description: string;
    category: string;
    aliases: string[];
    tags: string[];
    unicode_version: string;
    ios_version: string;
    skin_tones?: boolean;
  }[] = JSON.parse(fs.readFileSync(path.resolve("./src/server/types/emoji/emoji.json"), "utf8"));
  public static getEmojiByName(name: string) {
    name = name.toLowerCase();
    const emoji = Emoji.db.find(
      (emoji) =>
        emoji.emoji === name ||
        emoji.aliases.includes(name) ||
        emoji.tags.includes(name) ||
        emoji.description.toLowerCase() === name ||
        emoji.description.toLowerCase() === `flag: ${name}`
    );
    if (!emoji) {
      return null;
    }
    return emoji;
  }
}
