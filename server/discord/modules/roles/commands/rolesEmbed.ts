import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("roles-embed")
  .setDescription("Sends the role picker embed")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setFunction(async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("Roles")
      .setDescription("Select your roles!")
      .setColor(Colors.Yellow);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("role-menu")
        .setLabel("Select Roles")
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