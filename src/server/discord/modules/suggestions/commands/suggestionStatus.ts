import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import SuggestionsModule from "..";

const Command = new SlashCommandBuilder()
  .setName("suggestionstatus")
  .setDescription("change a suggestion's status")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addIntegerOption((option) =>
    option.setName("suggestionid").setDescription("the id of the suggestion").setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("status")
      .setDescription("the status to change the suggestion to")
      .setRequired(true)
      .addChoices(
        {
          name: "Open",
          value: 0,
        },
        {
          name: "Pending",
          value: 1,
        },
        {
          name: "Accepted",
          value: 2,
        },
        {
          name: "Denied",
          value: 3,
        },
        {
          name: "Deleted",
          value: 4,
        }
      )
  )
  .setFunction(async (interaction) => {
    const suggestionId = interaction.options.getInteger("suggestionid");
    const status = interaction.options.getInteger("status");

    if (!suggestionId || !status) {
      return interaction.reply({
        ephemeral: true,
        content: "Invalid suggestion id or status",
      });
    }

    const suggestion = SuggestionsModule.getSuggestionsModule().suggestionCache.get(suggestionId);

    if (!suggestion) {
      return interaction.reply({
        ephemeral: true,
        content: "Suggestion not found",
      });
    }

    await SuggestionsModule.getSuggestionsModule().setSuggestionStatus(suggestion, status);

    interaction.reply({
      ephemeral: true,
      content: "Suggestion status changed!",
    });
  });

export default Command;
