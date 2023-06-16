import { ChannelType } from "discord.js";
import { bot } from "../../core";
import Module from "../../core/base/module";
import { EmbedBuilder } from "@discordjs/builders";

export default class LoggingModule extends Module {
  public name = "logging";
  public description = "No description provided";

  public static getLoggingModule(): LoggingModule {
    return bot.moduleLoader.getModule("logging") as LoggingModule;
  }

  public override async onLoad(): Promise<boolean> {
    const channel = await bot.client.channels.fetch("1116036392510836756");

    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error("Could not find logging channel");
      return false;
    }

    bot.client.on("messageDelete", async (message) => {
      if (message.author!.bot) return;

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Message Deleted")
            .setDescription(
              [
                `${message.author!.toString()} deleted a message in ${
                  message.channel.hasOwnProperty("name") ? `#${(message.channel as any).name}` : "a DM"
                }`,
                "",
                `**Message:**`,
                message.content,
                `**Attachments:**`,
                message.attachments.map((a) => a.url).join("\n"),
                `**Created At:**`,
                `<t:${Math.floor(message.createdTimestamp / 1000)}:R> (<t:${Math.floor(
                  message.createdTimestamp / 1000
                )}:F>)`,
                `**Deleted At:**`,
                `<t:${Math.floor(Date.now() / 1000)}:R> (<t:${Math.floor(Date.now() / 1000)}:F>)`,
              ].join("\n")
            ),
        ],
      });
    });

    bot.client.on("messageUpdate", async (oldMessage, newMessage) => {
      if (oldMessage.author!.bot) return;
      if (oldMessage.content === newMessage.content) return;

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Message Edited")
            .setDescription(
              [
                `${oldMessage.author!.toString()} edited a message in ${
                  oldMessage.channel.hasOwnProperty("name") ? `#${(oldMessage.channel as any).name}` : "a DM"
                }`,
                "",
                `**Old Message:**`,
                oldMessage.content,
                `**New Message:**`,
                newMessage.content,
                `**Attachments:**`,
                oldMessage.attachments.map((a) => a.url).join("\n"),
                `**Created At:**`,
                `<t:${Math.floor(oldMessage.createdTimestamp / 1000)}:R> (<t:${Math.floor(
                  oldMessage.createdTimestamp / 1000
                )}:F>)`,
                `**Edited At:**`,
                `<t:${Math.floor(Date.now() / 1000)}:R> (<t:${Math.floor(Date.now() / 1000)}:F>)`,
              ].join("\n")
            ),
        ],
      });
    });

    return true;
  }
}
