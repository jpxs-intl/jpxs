import { MessageType } from "discord.js";
import { bot } from "../../core";
import Module from "../../core/base/module";
import StatusImage from "./stats";
import Logger from "../../core/utils/logger";

export default class InfoModule extends Module {
  public name = "info";
  public description = "No description provided";

  public static getInfoModule(): InfoModule {
    return bot.moduleLoader.getModule("info") as InfoModule;
  }

  public override async onLoad(): Promise<boolean> {
    StatusImage.init();

    bot.client.on("messageCreate", async (message) => {
      if (
        message.type == MessageType.Reply &&
        message.content.toLowerCase().includes("trans react this guy")
      ) {
        const replyMessage = await message.fetchReference();
        const replyAuthor = replyMessage.author;

        const messages = await message.channel.messages.fetch({ limit: 100, cache: true });

        messages.forEach(async (message) => {
          if (message.author.id !== replyAuthor.id) return;

          await message.react("🏳️‍⚧️");
        });

        await message.react("✅");
      }
    });

    return true;
  }
}
