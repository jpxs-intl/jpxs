import { Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import InstructionManager from "../../../../server/data/instructionManager.js";

const Command = new SlashCommandBuilder()
    .setName("reload")
    .setDescription("reload jpxs on all servers")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setFunction(async (interaction) => {
        InstructionManager.reloadAllServers()

        const embed = new EmbedBuilder()
            .setTitle("Reloaded all servers")
            .setDescription(`Reloaded all servers.`)
            .setColor(Colors.Green)
            .setTimestamp()

        await interaction.reply({
            embeds: [embed]
        })
    });

export default Command;