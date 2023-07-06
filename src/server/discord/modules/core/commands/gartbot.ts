import { EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("gartbot")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription("Pong!")
  .addStringOption((option) => option.setName("text").setDescription("The text to say").setRequired(true))
  .setFunction(async (interaction) => {
    const text = interaction.options.getString("text", true);

    let webhook = await interaction.guild?.fetchWebhooks().then((webhooks) => {
      return webhooks.find((webhook) => webhook.name === "JPXS");
    });

    if (!webhook) {
      webhook = await interaction.guild?.channels.createWebhook({
        name: "JPXS",
        channel: interaction.channel?.id as string,
        avatar:
          "https://cdn.discordapp.com/avatars/878112363939762226/6850c6237f790d6c874ae74d24e46793.webp?size=1024&width=0&height=281",
      });
    }

    if (!webhook) return;

    await webhook.send({
      content: text,
      username: "gart",
      body: {
        content: text,
      },
      avatarURL:
        "https://cdn.discordapp.com/avatars/232510731067588608/8006c30638a53f92abffacf46f390e6f.webp?size=1024&width=0&height=281",
    });

    await interaction.reply({
        content: "Sent!",
        ephemeral: true
    })
  });

export default Command;
