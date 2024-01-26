import { EmbedBuilder } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";

const Command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong!")
  .setFunction(async (interaction) => {
    const msg = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });

    await interaction.editReply({
        content: `Pong!`,
        embeds: [
          new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription(
              [
                `**Latency:** ${msg.createdTimestamp - interaction.createdTimestamp}ms`,
                `**API Latency:** ${Math.round(interaction.client.ws.ping)}ms`,
                `**Uptime:** ${time(interaction.client.uptime).toString()}`,
              ].join("\n"))
            .setColor("Random")
            .setTimestamp()
        ]
            
    })
  });

export default Command;