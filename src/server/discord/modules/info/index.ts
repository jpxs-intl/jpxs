import { MessageType, Webhook } from "discord.js";
import { bot } from "../../core";
import Module from "../../core/base/module";
import StatusImage from "./stats";
import Emoji from "../../../types/emoji/emoji";

export default class InfoModule extends Module {
  public name = "info";
  public description = "No description provided";

  public static meowMondays = true;
  public static hooks: Webhook[] = [];

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
          return;
        }

        const emoji = Emoji.getEmojiByName(tag)?.emoji;

        console.log(emoji);

        if (!emoji) {
          await message.react("❌");
          return;
        }

        const replyMessage = await message.fetchReference();
        const replyAuthor = replyMessage.author;

        const messages = await message.channel.messages.fetch({ limit: 20, cache: true });

        messages.forEach(async (message) => {
          if (message.author.id !== replyAuthor.id) return;

          await message.react(emoji);
        });
      }

      if (InfoModule.meowMondays) {
        if (message.author.bot || message.member?.roles.cache.has("1130594142603452528")) return;

        message.delete().catch(() => {});

        const meows = [
          "meow",
          "mrrow",
          "mew",
          "mrrrp",
          "mewo",
          "prrrr",
          ":3",
          ":3c",
          "mrreow",
          "prrrerrb",
          "MEEEOOOOW",
          "mraw",
          "miau",
          "мяу",
          "nya",
        ];

        let webhook = InfoModule.hooks.find(
          (webhook) => webhook.name === "JPXS" && webhook.channelId === message.channel?.id
        );

        if (!webhook) {
          await message.guild?.fetchWebhooks().then((webhooks) => {
            webhook = webhooks.find((webhook) => webhook.name === "JPXS" && webhook.channelId === message.channel?.id);
            if (webhook) InfoModule.hooks.push(webhook);
          });
        }

        if (!webhook) {
          // @ts-ignore
          webhook = await message.guild?.channels
            .createWebhook({
              name: "JPXS",
              channel: message.channel?.id as string,
              avatar:
                "https://cdn.discordapp.com/avatars/878112363939762226/6850c6237f790d6c874ae74d24e46793.webp?size=1024&width=0&height=281",
            })
            .catch(() => {});
        }

        if (!webhook || message.content == "") return;

        console.log(message.content);

        const text = message.content
          .split(" ")
          .map(() => {
            return meows[Math.floor(Math.random() * meows.length)];
          })
          .join(" ");

        await webhook
          .send({
            username: message.member?.displayName,
            content: text,
            avatarURL: message.member?.displayAvatarURL(),
          })
          .catch(() => {});
      }
    });

    return true;
  }
}
