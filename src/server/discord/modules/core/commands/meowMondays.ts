import { GuildTextBasedChannel, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import InfoModule from "../../info";

const Command = new SlashCommandBuilder()
  .setName("meowmondays")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .setDescription("Toggle meow mondays")
  .setFunction(async (interaction) => {
    InfoModule.meowMondays = !InfoModule.meowMondays;

    await interaction.reply({
      content: `Meow mondays has been ${InfoModule.meowMondays ? "enabled" : "disabled"}`,
    });
  });

export default Command;
