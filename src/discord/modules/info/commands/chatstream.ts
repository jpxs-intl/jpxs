import { AutocompleteInteraction, PermissionFlagsBits } from "discord.js";
import DataStorage from "../../../../server/data/dataStorage.js";
import InstructionManager from "../../../../server/data/instructionManager.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import ChatStreamManager from "../chatStreamManager.js";
import Autocomplete from "../util/autocomplete.js";



const Command = new SlashCommandBuilder()
    .setName("chatstream")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .setDescription("Stream a server's chat to this channel.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("start")
            .setDescription("Start streaming a server's chat to this channel.")
            .addStringOption(option =>
                option.setName("server")
                    .setDescription("The server to stream the chat from")
                    .setRequired(true)
                    .setAutocomplete(Autocomplete.servers)
            )
            .addBooleanOption(option =>
                option.setName("bidirectional")
                    .setDescription("Enable bidirectional chat streaming (send messages to the server)")
                    .setRequired(false)
            )
            .setFunction(async (interaction) => {
                const serverId = interaction.options.getString("server", true);
                const bidirectional = interaction.options.getBoolean("bidirectional", false);
                const channel = interaction.channel;

                if (!channel || !channel.isTextBased()) {
                    await interaction.reply({ content: "This command can only be used in a text channel." });
                    return
                }

                if (ChatStreamManager.streams[serverId]) {
                    await interaction.reply({ content: `Chat is already being streamed from this server in <#${ChatStreamManager.streams[serverId]}>.` });
                    return
                }

                ChatStreamManager.streams[serverId] = channel.id;

                if (bidirectional) {
                    ChatStreamManager.bidirectionalStreams[serverId] = channel.id;
                } else {
                    delete ChatStreamManager.bidirectionalStreams[serverId];
                }

                interaction.reply({ content: `Started streaming chat from server ${serverId} to this channel. ${bidirectional ? "Bidirectional streaming is enabled." : "Bidirectional streaming is disabled."}` });
            })
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("stop")
            .setDescription("Stop streaming a server's chat to this channel.")
            .addStringOption(option =>
                option.setName("server")
                    .setDescription("The server to stop streaming the chat from")
                    .setRequired(true)
                    .setAutocomplete(Autocomplete.servers)
            )
            .setFunction(async (interaction) => {
                const serverId = interaction.options.getString("server", true);

                if (!ChatStreamManager.streams[serverId]) {
                    await interaction.reply({ content: `No chat stream found for server ${serverId}.` });
                    return
                }

                delete ChatStreamManager.streams[serverId];
                delete ChatStreamManager.bidirectionalStreams[serverId];

                interaction.reply({ content: `Stopped streaming chat from server ${serverId}.` });
            })
    )

export default Command;