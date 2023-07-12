import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Collection,
  Colors,
  EmbedBuilder,
  GuildTextBasedChannel,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { bot } from "../../core";
import Module from "../../core/base/module";
import { Suggestion, SuggestionStatus } from "./entities/suggestion";
import { db } from "../../../..";
import Logger from "../../core/utils/logger";
import Utils from "../../core/utils/utils";
import Time from "../../core/utils/time";

export default class SuggestionsModule extends Module {
  public name = "suggestions";
  public description = "manages suggestions";
  public suggestionCache: Collection<number, Suggestion> = new Collection();

  public static emojis = {
    greenStart: "<:greencap:1124017133643374612>",
    greenMiddle: "<:greenbar:1124017132057931897>",
    greenEnd: "<:green100percent:1124017129377767446>",
    redStart: "<:redcap:1124017143034417263>",
    redMiddle: "<:redbar:1124017141499297914>",
    redEnd: "<:red100percent:1124017140018716752>",
    greenRedStart: "<:red99percent:1124017137359532073>",
    redGreenStart: "<:green99percent:1124017128115281950>",
    middle: "<:greenredbar:1124017135946043444>",
    upvote: "<:jpxsupvotegreen:1128493428968280205>",
    downvote: "<:jpxsdownvotered:1128493447121207377>",
  };

  public channels!: {
    suggestions: GuildTextBasedChannel;
    awaitingApproval: GuildTextBasedChannel;
    archive: GuildTextBasedChannel;
  };

  public override async onLoad(): Promise<boolean> {
    this.channels = {
      suggestions: (await bot.client.channels.fetch("1128490708609814619")) as GuildTextBasedChannel,
      awaitingApproval: (await bot.client.channels.fetch("1128490770081529987")) as GuildTextBasedChannel,
      archive: (await bot.client.channels.fetch("1128490792961462343")) as GuildTextBasedChannel,
    };

    const suggestions = await db.em.find(Suggestion, {});

    suggestions.forEach((suggestion) => {
      this.suggestionCache.set(suggestion.id, suggestion);

      bot.buttonManager.registerButton(`${suggestion.id}:positive`, async (interaction) => {
        await this.voteSuggestion(interaction, suggestion, interaction.user.id, true);
      });

      bot.buttonManager.registerButton(`${suggestion.id}:negative`, async (interaction) => {
        await this.voteSuggestion(interaction, suggestion, interaction.user.id, false);
      });

      bot.buttonManager.registerButton(`${suggestion.id}:thread`, async (interaction) => {});
    });

    Logger.log("Suggestions", `Loaded ${this.suggestionCache.size} suggestions`);

    bot.buttonManager.registerButton("suggestion-create", async (interaction) => {
      const modal = new ModalBuilder()
        .setTitle("Create Suggestion")
        .setCustomId(`${interaction.user.id}:suggestion-create`)
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("suggestion")
              .setPlaceholder("Suggestion")
              .setLabel("Your suggestion")
              .setMinLength(1)
              .setMaxLength(1024)
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      await interaction.showModal(modal);

      bot.modalManager.registerModal(`${interaction.user.id}:suggestion-create`, async (interaction) => {
        const suggestion = await this.createSuggestion(
          interaction.fields.getTextInputValue("suggestion"),
          interaction.user.id
        );
        await interaction.reply({
          ephemeral: true,
          content: `Created suggestion #${suggestion.id}! You can see it [here](<https://discord.com/channels/${interaction.guildId}/${this.channels.suggestions.id}/${suggestion.messageId}>)!`,
        });
      });
    });

    return true;
  }

  public async voteSuggestion(
    interaction: ButtonInteraction,
    suggestion: Suggestion,
    userId: string,
    positive: boolean
  ) {
    if (positive) {
      if (suggestion.upvoters.includes(userId)) return;
      suggestion.upvoters.push(userId);
      if (suggestion.downvoters.includes(userId)) {
        suggestion.downvoters.splice(suggestion.downvoters.indexOf(userId), 1);
      }
    } else {
      if (suggestion.downvoters.includes(userId)) return;
      suggestion.downvoters.push(userId);
      if (suggestion.upvoters.includes(userId)) {
        suggestion.upvoters.splice(suggestion.upvoters.indexOf(userId), 1);
      }
    }

    const message = await this.channels.suggestions.messages.fetch(suggestion.messageId);
    if (!message) return;
    await interaction.update(this.buildSuggestionMessage(suggestion));

    await this.saveSuggestion(suggestion);
  }

  public async saveSuggestion(suggestion: Suggestion) {
    await db.em.persistAndFlush(suggestion);
    this.suggestionCache.set(suggestion.id, suggestion);
    return suggestion;
  }

  public buildSuggestionEmbed(suggestion: Suggestion): EmbedBuilder {
    const bar = this.buildSuggestionBar(suggestion);
    const total = suggestion.upvoters.length + suggestion.downvoters.length;
    const upPercent = Math.round((suggestion.upvoters.length / total) * 100);
    const downPercent = Math.round((suggestion.downvoters.length / total) * 100);

    return new EmbedBuilder()
      .setTitle(`Suggestion #${suggestion.id}`)
      .setDescription(
        [
          suggestion.suggestion,
          "",
          `${suggestion.upvoters.length} (${upPercent}%) ${bar} ${suggestion.downvoters.length} (${downPercent}%)`,
          "",
          `created ${Utils.discordTimestamp(suggestion.createdAt, "longDateTime")}`,
          `ends ${Utils.discordTimestamp(
            new Date(suggestion.createdAt.getTime() + new Time("1 week").ms()),
            "relative"
          )}`,
          "",
          `Created by <@${suggestion.authorId}>`,
        ].join("\n")
      )
      .setColor(upPercent > downPercent ? Colors.Green : Colors.Red)
      .setTimestamp(suggestion.createdAt);
  }

  public buildSuggestionBar(suggestion: Suggestion): string {
    const barLength = 12;

    const upvotes = suggestion.upvoters.length;
    const downvotes = suggestion.downvoters.length;

    const total = upvotes + downvotes;

    const upvotePercentage = Math.round((upvotes / total) * 100);
    const downvotePercentage = Math.round((downvotes / total) * 100);

    const upvoteBarLength = Math.round((upvotePercentage / 100) * barLength);
    const downvoteBarLength = Math.round((downvotePercentage / 100) * barLength);

    const rem = ((upvotePercentage / 100) * barLength) % 1;
    const isSplitMidpoint = rem > 0.25 && rem < 0.75;

    const isStartSplit = upvoteBarLength < 1 && isSplitMidpoint;
    const isEndSplit = upvoteBarLength > barLength - 1 && isSplitMidpoint;

    let bar = "";

    /*
    Bar construction:
    - Start
    - Middle
    - End

    if start is split, add green/red start
    otherwise, add green start

    continue adding green middle until we reach the end of the green bar
    if midpoint is split, add green/red middle
    otherwise, round up/down and add green/red middle

    add red middle until we reach the end of the red bar
    if end is split, add red/green end
    otherwise, add red end

    */

    if (upvoteBarLength > 0) {
      bar += isStartSplit ? SuggestionsModule.emojis.greenRedStart : SuggestionsModule.emojis.greenStart;
      for (let i = 0; i <= upvoteBarLength; i++) {
        bar += SuggestionsModule.emojis.greenMiddle;
      }
    } else {
      bar += SuggestionsModule.emojis.redEnd;
    }

    if (isSplitMidpoint) {
      bar += SuggestionsModule.emojis.middle;
    } else if (upvoteBarLength > 0 && downvoteBarLength) {
      bar += rem > 0.5 ? SuggestionsModule.emojis.greenMiddle : SuggestionsModule.emojis.redMiddle;
    }

    if (downvoteBarLength > 0) {
      for (let i = 0; i <= downvoteBarLength; i++) {
        bar += SuggestionsModule.emojis.redMiddle;
      }
      bar += isEndSplit ? SuggestionsModule.emojis.redGreenStart : SuggestionsModule.emojis.redStart;
    } else {
      bar += SuggestionsModule.emojis.greenEnd;
    }

    return bar;
  }

  public buildSuggestionButtons(suggestion: Suggestion): ActionRowBuilder<ButtonBuilder>[] {
    switch (suggestion.status) {
      case SuggestionStatus.Open:
        return [new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`${suggestion.id}:positive`)
            .setEmoji(SuggestionsModule.emojis.upvote)
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`${suggestion.id}:negative`)
            .setEmoji(SuggestionsModule.emojis.downvote)
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`${suggestion.id}:thread`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🧵")
        )];
      case SuggestionStatus.Pending:
        return [new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`${suggestion.id}:approve`)
            .setLabel("Approve")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`${suggestion.id}:deny`)
            .setLabel("Deny")
            .setStyle(ButtonStyle.Danger)
        )];
      case SuggestionStatus.Accepted:
      case SuggestionStatus.Denied:
      case SuggestionStatus.Deleted:
        return []
    }
  }

  public buildSuggestionMessage(suggestion: Suggestion): {
    embeds: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder>[];
    content: string | null;
  } {
    return {
      content: null,
      embeds: [this.buildSuggestionEmbed(suggestion)],
      components: this.buildSuggestionButtons(suggestion),
    };
  }

  public async createSuggestion(suggestion: string, authorId: string): Promise<Suggestion> {
    let suggestionEntity = new Suggestion();
    suggestionEntity.suggestion = suggestion;
    suggestionEntity.authorId = authorId;
    suggestionEntity.createdAt = new Date();
    suggestionEntity.status = SuggestionStatus.Open;
    suggestionEntity.upvoters = [authorId];
    suggestionEntity.downvoters = [];
    suggestionEntity.reason = "";
    suggestionEntity.messageId = "unknown";

    suggestionEntity = await this.saveSuggestion(suggestionEntity);

    const message = await this.channels.suggestions.send({
      content: "Loading...",
    });
    suggestionEntity.messageId = message.id;

    const finishedSuggestion = await this.saveSuggestion(suggestionEntity);

    await message.edit(this.buildSuggestionMessage(finishedSuggestion));

    console.log(finishedSuggestion.messageId);

    bot.buttonManager.registerButton(`${suggestionEntity.id}:positive`, async (interaction) => {
      await this.voteSuggestion(interaction, finishedSuggestion, interaction.user.id, true);
    });

    bot.buttonManager.registerButton(`${suggestionEntity.id}:negative`, async (interaction) => {
      await this.voteSuggestion(interaction, finishedSuggestion, interaction.user.id, false);
    });

    bot.buttonManager.registerButton(`${suggestionEntity.id}:thread`, async (interaction) => {});

    return suggestionEntity;
  }

  public async setSuggestionStatus(suggestion: Suggestion, status: SuggestionStatus): Promise<Suggestion>;
  public async setSuggestionStatus(
    suggestion: Suggestion,
    status: SuggestionStatus.Accepted | SuggestionStatus.Denied | SuggestionStatus.Deleted,
    reason?: string
  ): Promise<Suggestion>;
  public async setSuggestionStatus(
    suggestion: Suggestion,
    status: SuggestionStatus,
    reason?: string
  ): Promise<Suggestion> {
    suggestion.status = status;
    suggestion.reason = reason ?? "";

    await this.saveSuggestion(suggestion);

    let message = await this.channels.suggestions.messages.fetch(suggestion.messageId);
    if (!message) return suggestion;
    if (message.deletable) await message.delete();

    let channel: GuildTextBasedChannel;

    switch (status) {
      case SuggestionStatus.Open:
        channel = this.channels.suggestions;
        break;
      case SuggestionStatus.Pending:
        channel = this.channels.awaitingApproval;
        break;
      case SuggestionStatus.Accepted:
      case SuggestionStatus.Denied:
      case SuggestionStatus.Deleted:
        channel = this.channels.archive;
        break;
    }

    message = await channel.send({
      content: "Loading...",
    });

    suggestion.messageId = message.id;
    await this.saveSuggestion(suggestion);
    await message.edit(this.buildSuggestionMessage(suggestion));

    return suggestion;
  }

  public getStatusChannel(status: SuggestionStatus): GuildTextBasedChannel {
    switch (status) {
      case SuggestionStatus.Open:
        return this.channels.suggestions;
      case SuggestionStatus.Pending:
        return this.channels.awaitingApproval;
      case SuggestionStatus.Accepted:
      case SuggestionStatus.Denied:
      case SuggestionStatus.Deleted:
        return this.channels.archive;
    }
  }

  public static getSuggestionsModule(): SuggestionsModule {
    return bot.moduleLoader.getModule("suggestions") as SuggestionsModule;
  }
}
