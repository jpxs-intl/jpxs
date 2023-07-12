import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("suggestion-embed")
  .setDescription("Sends the suggestion create embed")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setFunction(async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("JPXS Suggestions")
      .setDescription("Hit the button to create a suggestion!")
      .setColor(Colors.Orange);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("suggestion-create")
        .setLabel("Create Suggestion")
        .setStyle(ButtonStyle.Primary)
    );

    interaction.channel?.send({
      embeds: [embed],
      components: [row],
    });

    interaction.reply({
      ephemeral: true,
      content: "Embed sent!",
    });
  })

export default Command;