import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";
import VerificationCodeManager from "../../../../database/verificationCodeManager";
import { db } from "../../../core";
import { User } from "../../../../../database/entities/user.entity";
import CacheStorage from "../../../../database/cacheStorage";

const Command = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Get verified")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("link")
            .setDescription("Verify yourself via the website")
            .setFunction(async (interaction) => {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Get Verified")
                            .setDescription("Click the button below to get Verified")
                            .setColor(Colors.Orange)
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel("Verify")
                                    .setURL("https://jpxs.io/link")
                            )
                    ]
                })


            })
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("code")
            .setDescription("Verify yourself via a code")
            .setFunction(async (interaction) => {

                const code = VerificationCodeManager.generateCode(interaction.user.id);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Get Verified")
                            .setDescription(`Join a server and type \`verify ${code.match(/.{1,3}/g)?.join(' ')}\` to get verified!`)
                            .setColor(Colors.Orange)
                    ],
                    ephemeral: true
                })

            })

    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("unverify")
            .setDescription("Unverify yourself")
            .setFunction(async (interaction) => {

                const user = await db.em.findOneOrFail(User, { discordId: interaction.user.id });

                if (!user) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Unverify")
                                .setDescription("You are not verified")
                                .setColor(Colors.Orange)
                        ]
                    })
                    return;
                }

                user.discordId = undefined;
                CacheStorage.users.set(user.phoneNumber, user);

                await db.em.persistAndFlush(user).catch((err) => {
                    console.error(err);
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Unverify")
                                .setDescription("An error occurred")
                                .setColor(Colors.Orange)
                        ]
                    })
                });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Unverify")
                            .setDescription("You have been unverified")
                            .setColor(Colors.Orange)
                    ],
                    ephemeral: true
                })
            })
    )


export default Command;