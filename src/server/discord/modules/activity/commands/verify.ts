import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";

const Command = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Get verified")
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


    });

export default Command;