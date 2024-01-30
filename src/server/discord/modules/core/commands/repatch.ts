import { Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import DataStorage from "../../../../data/dataStorage";
import PatchManager from "../../../../data/patch/patchManager";

const Command = new SlashCommandBuilder()
  .setName("repatch")
  .setDescription("Reload Patches")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .setFunction(async (interaction) => {

    PatchManager.loadPatches()

    Object.values(DataStorage.serverData).forEach((serverData) => {
      serverData.sentPatch = false;
    });

    const embed = new EmbedBuilder()
      .setTitle("Repatched")
      .setDescription("All servers will be repatched on next update")
      .setColor(Colors.Green)
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [embed] });
  });

export default Command;
