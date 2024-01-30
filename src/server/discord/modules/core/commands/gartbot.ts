import { Colors, EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("gartbot")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription("Pong!")
  .addStringOption((option) => option.setName("text").setDescription("The text to say").setRequired(true))
  .setFunction(async (interaction) => {
    const text = interaction.options.getString("text", true);

    let webhook = await interaction.guild?.fetchWebhooks().then((webhooks) => {
      return webhooks.find((webhook) => webhook.name === "JPXS" && webhook.channelId == "1181465915796226048");
    });

    if (!webhook) {
      webhook = await interaction.guild?.channels.createWebhook({
        name: "JPXS",
        channel: "1181465915796226048",
        avatar:
          "https://cdn.discordapp.com/avatars/878112363939762226/6850c6237f790d6c874ae74d24e46793.webp?size=1024&width=0&height=281",
      });
    }

    if (!webhook) return;

    const msg = await webhook.send({
      username: "JPXS",
        embeds: [
          new EmbedBuilder()
            .setTitle("Notice")
            .setDescription(text)
            .setColor(Colors.Orange)
            .toJSON()
        ],
      avatarURL:
        "https://cdn.discordapp.com/avatars/878112363939762226/6850c6237f790d6c874ae74d24e46793.webp?size=1024&width=0&height=281",
    });

    await msg.pin();

    await interaction.reply({
        content: "Sent!",
        ephemeral: true
    })
  });

export default Command;
