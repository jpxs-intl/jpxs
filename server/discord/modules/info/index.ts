import { MessageType } from "discord.js";
import { bot } from "../../core";
import Module from "../../core/base/module";
import StatusImage from "./stats";
import Emoji from "../../../types/emoji/emoji";

export default class InfoModule extends Module {
  public name = "info";
  public description = "No description provided";

  public static getInfoModule(): InfoModule {
    return bot.moduleLoader.getModule("info") as InfoModule;
  }

  public override async onLoad(): Promise<boolean> {
    StatusImage.init();

    bot.client.on("messageCreate", async (message) => {
      if (message.type == MessageType.Reply && message.content.toLowerCase().includes("trans react")) {
        const replyMessage = await message.fetchReference();
        const replyAuthor = replyMessage.author;

        const messages = await message.channel.messages.fetch({ limit: 100, cache: true });

        messages.forEach(async (message) => {
          if (message.author.id !== replyAuthor.id) return;

          await message.react("🏳️‍⚧️");
        });

        await message.react("✅");
        return;
      }

      if (message.type == MessageType.Reply && /(.+) react/gi.test(message.content)) {
        const tag = /(?<emoji>.+) react/gi.exec(message.content)?.groups?.emoji;

        console.log(tag);

        if (!tag) {
          await message.react("❌");
          return
        }

        const emoji = Emoji.getEmojiByName(tag)?.emoji;

        console.log(emoji);

        if (!emoji) {
          await message.react("❌");
          return
        }

        const replyMessage = await message.fetchReference();
        const replyAuthor = replyMessage.author;

        const messages = await message.channel.messages.fetch({ limit: 20, cache: true });

        messages.forEach(async (message) => {
          if (message.author.id !== replyAuthor.id) return;

          await message.react(emoji);
        });
      }
    });

    return true;
  }
}
