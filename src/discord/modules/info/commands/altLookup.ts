import { Colors, ContainerBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import AltManager from "../../../../server/data/players/altManager.js";
import PlayerManager from "../../../../server/data/players/playerManager.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import Autocomplete from "../util/autocomplete.js";



const Command = new SlashCommandBuilder()
    .setName("altlookup")
    .setDescription("Look up alt accounts for a player.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName("query")
            .setDescription("The name or ID of the player to search for.")
            .setRequired(true)
            .setAutocomplete(Autocomplete.players)
    )
    .addBooleanOption(option =>
        option.setName("recursive")
            .setDescription("Whether to recursively search for alts.")
            .setRequired(false)
    )
    .setFunction(async (interaction) => {

        await interaction.deferReply({ ephemeral: true });

        const query = interaction.options.getString("query", true);
        const recursive = interaction.options.getBoolean("recursive", false);

        const alts = await AltManager.findAlts(query, {
            recursive: recursive || false,
        });

        if (!alts || alts.length === 0) {
            return interaction.editReply({ content: "No alt accounts found for this player." });
        }

        const container = new ContainerBuilder()
            .setAccentColor(Colors.Blue)
            .addSectionComponents((section) => section
                .addTextDisplayComponents((text) => text.setContent(`Alt accounts for \`${alts[0].player.nameHistory[0]?.name || "Unknown Player"
                    }\`:\n\`${alts[0].player.phoneNumber} - ${alts[0].player.gameId}\``))
                .setThumbnailAccessory((thumbnail) => thumbnail.setURL(`https://avatars.jpxs.io/${alts[0].player.phoneNumber}?size=128`))
            )

        alts.forEach((alt, index) => {
            if (index >= 10) return;
            if (index == 0) return; // Skip the first player as they are the main player
            container.addSectionComponents((section) => section
                .addTextDisplayComponents((text) => text.setContent([
                    `${index}. **${alt.player.nameHistory[0]?.name || "Unknown Player"}**`,
                    `\`${alt.player.phoneNumber} - ${alt.player.gameId}\``,
                    `Shared IPs: \`${alt.sharedIps.join("`, `")}\``,
                ].join(`\n`)))
                .setThumbnailAccessory((thumbnail) => thumbnail.setURL(`https://avatars.jpxs.io/${alt.player.phoneNumber}?size=128`))
            );
        })

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    })

export default Command;