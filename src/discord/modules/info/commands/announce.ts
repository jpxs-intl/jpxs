import DataStorage from "../../../../server/data/dataStorage.js";
import InstructionManager from "../../../../server/data/instructionManager.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import Autocomplete from "../util/autocomplete.js";

const Command = new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce a message to one or all servers.")
    .addStringOption(option =>
        option.setName("message")
            .setDescription("The message to announce")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("server")
            .setDescription("The server to announce the message to (leave blank for all servers)")
            .setAutocomplete(Autocomplete.servers)
    )
    .setFunction(async (interaction) => {
        const message = interaction.options.getString("message", true);
        const serverId = interaction.options.getString("server", false);

        InstructionManager.announce(message, serverId || undefined)

        interaction.reply({
            content: `Announcement sent to ${serverId ? `${DataStorage.serverInfo[serverId].name} (${serverId})` : "all servers"}.`,
            ephemeral: true
        })
    });

export default Command;