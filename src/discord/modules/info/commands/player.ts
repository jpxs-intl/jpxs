import { ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import PlayerManager from "../../../../server/data/players/playerManager.js";
import Util from "../../../../utils/index.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";

const Command = new SlashCommandBuilder()
    .setName("player")
    .setDescription("Search for a player.")
    .addStringOption(option =>
        option.setName("query")
            .setDescription("The name or ID of the player to search for.")
            .setRequired(true)
            .setAutocomplete(async (interaction) => {
                const query = interaction.options.getString("query", true);
                const res = await PlayerManager.findPlayers(query, {
                    populate: ["nameHistory"],
                    orderBy: { lastSeen: "DESC" },
                    limit: 5,
                });

                if (!res) {
                    return [];
                }

                return res.map(player => ({
                    name: `${player.nameHistory[0]?.name} (${Util.formatPhone(player.phoneNumber)})`,
                    value: player.phoneNumber.toString(),
                }));
            })
    )
    .setFunction(async (interaction) => {
        const query = interaction.options.getString("query", true);
        const player = await PlayerManager.findPlayer(query, {
            populate: ["sessions", "avatarHistory", "avatarHistory.avatar"],
            orderBy: {
                sessions: {
                    startedAt: "DESC",
                },
            },
        });

        if (!player) {
            return interaction.reply({ content: "Player not found.", ephemeral: true });
        }

        const name = await player.getName() || "Unknown Player";
        const lastSession = player?.sessions?.[0];
        const serverName = (await lastSession?.server?.getName()) || "Unknown Server";

        const container = new ContainerBuilder()
            .setAccentColor(Colors.Blue)
            .addSectionComponents((section) => section
                .addTextDisplayComponents((text) => text.setContent(`# ${name}\n\`${Util.formatPhone(player.phoneNumber)}\` - \`${player.gameId}\``))
                .setThumbnailAccessory((thumbnail) => thumbnail.setURL(`https://avatars.jpxs.io/${player.phoneNumber}?size=128`))
            )
            .addActionRowComponents((row) => row
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("View Profile")
                        .setURL(`https://beta.jpxs.io/player/${player.phoneNumber}`)
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel("View Steam Profile")
                        .setURL(`https://steamcommunity.com/profiles/${player.steamId}`)
                        .setStyle(ButtonStyle.Link),
                    player.avatarHistory?.[0] ?
                        new ButtonBuilder()
                            .setLabel("View Avatar")
                            .setURL(player.avatarHistory?.[0].avatar.url({ body: false, antiAliasing: true, rotate: true }))
                            .setStyle(ButtonStyle.Link)
                        : new ButtonBuilder()
                            .setLabel("Unknown Avatar")
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Link)
                )
            )
            .addSeparatorComponents((separator) => separator
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
            )

        if (lastSession) {
            container.addSectionComponents((section) => section
                .addTextDisplayComponents((text) => text.setContent(lastSession.endedAt ? `**Last Seen:** <t:${Math.floor(lastSession.startedAt.getTime() / 1000)}:f> on ${serverName}` : `**Currently Online:** ${serverName}`))
                .setButtonAccessory((button) => button
                    .setLabel("View Server")
                    .setURL(`https://beta.jpxs.io/server/${lastSession.server.id}`)
                    .setStyle(ButtonStyle.Link)
                )
            )
        }

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        })
    });

export default Command;

