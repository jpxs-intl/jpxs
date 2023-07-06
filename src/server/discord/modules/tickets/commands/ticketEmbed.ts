import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("tickets-embed")
  .setDescription("Sends the ticket embed")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setFunction(async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("JPXS Tickets")
      .setColor(Colors.Orange);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("open-ticket")
        .setLabel("Open Ticket")
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