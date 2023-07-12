import { GuildTextBasedChannel, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("clear")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)
  .setDescription("Delete a bunch of shit")
  .addIntegerOption((o) =>
    o
      .setName("messagecount")
      .setDescription("Number of messages to delete")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(2048)
  )
  .setFunction(async (interaction) => {
    let messageCount = interaction.options.getInteger("messagecount", true);
    const channel = interaction.channel as GuildTextBasedChannel;

    let deletedCount = 0;

    interaction.deferReply();

    while (messageCount > 0) {
      const messages = await channel.bulkDelete(messageCount > 100 ? 100 : messageCount).catch(async (e) => {
        interaction.editReply({
          content: `\`\`\`${e}\`\`\``,
        });
      });

      if (messages) {
        messageCount -= messages.size;
        deletedCount += messages.size;
      }
      if (messageCount > 0) break;
    }

    await interaction.editReply({
      content: `${deletedCount} messages deleted!`,
    });
  });

export default Command;
