import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { bot, db } from "../../core";
import Module from "../../core/base/module";
import { Poll } from "./entities/poll";
import Logger from "../../core/utils/logger";

export default class PollModule extends Module {
  name = "poll";
  description = "Poll system";

  public polls: Poll[] = [];

  public static emojis = {
    bar: ["🟩", "🟥", "🟦", "🟨", "🟪", "🟧", "🟫", "⬜"],
    circle: ["🟢", "🔴", "🔵", "🟡", "🟣", "🟠", "🟤", "⚪"],
  };

  public static barLength = 10;

  public static getPollModule(): PollModule {
    return bot.moduleLoader.getModule("poll") as PollModule;
  }

  getPoll(id: string): Poll<true> | undefined {
    return this.polls.find((poll) => poll.id === id) as Poll<true> | undefined;
  }

  public override async onLoad(): Promise<boolean> {
    this.polls = await db.em.find(Poll, {});

    this.polls.forEach((poll, i) => {
      Object.keys(poll.options).forEach((option, i) => {
        bot.buttonManager.registerButton(
          `poll_${poll.id}_${i}`,
          PollModule.getPollModule().handleButton.bind(this)
        );

        Logger.info("Polls", `Registered button poll_${poll.id}_${i}`);
      });
    });

    Logger.info("Polls", `Loaded ${this.polls.length} polls`);

    return true;
  }

  public async createPoll(text: string, options: string[], channel: TextChannel): Promise<Poll<true>> {
    const poll = new Poll(text, options);
    this.polls.push(poll);

    const message = await channel.send({
      embeds: [this.buildEmbed(poll as any)],
      components: this.buildButtons(poll as any),
    });

    const newPoll = poll.setMessage(channel.id, message.id);

    await db.em.persistAndFlush(newPoll);

    return newPoll;
  }

  public buildEmbed(poll: Poll<true>): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(poll.text);

    const options = Object.keys(poll.options)
      .map((key, i) => {
        return {
          name: key,
          bar: PollModule.emojis.bar[i],
          circle: PollModule.emojis.circle[i],
          voteCount: poll.options[key].length,
          votes: poll.options[key],
        };
      })
      .sort((a, b) => b.voteCount - a.voteCount);

    let bar = "";

    const totalVotes = options.reduce((acc, option) => acc + option.voteCount, 0);

    for (const option of options) {
      const percentage = option.voteCount / totalVotes;
      const barLength = Math.round(percentage * PollModule.barLength);
      bar = bar + option.bar.repeat(barLength);
    }

    const description = Object.keys(poll.options)
      .map((key, i) => `${options[i].circle} **${options[i].name}** - ${options[i].voteCount} votes`)
      .join("\n");

    embed.setDescription(`${bar}\n\n${description}`);

    return embed;
  }

  public buildButtons(poll: Poll<true>): ActionRowBuilder<ButtonBuilder>[] {
    const buttons = Object.keys(poll.options).map((key, i) => {
      bot.buttonManager.registerButton(
        `poll_${poll.id}_${i}`,
        PollModule.getPollModule().handleButton.bind(this)
      );

      return new ButtonBuilder()
        .setCustomId(`poll_${poll.id}_${i}`)
        .setLabel(key)
        .setStyle(ButtonStyle.Primary);
    });

    const rows = [];

    while (buttons.length > 0) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().setComponents(buttons.splice(0, 5)));
    }

    return rows;
  }

  public async vote(
    poll: Poll<true>,
    option: string,
    userId: string,
    interaction?: ButtonInteraction
  ): Promise<void> {
    poll.addVote(option, userId);

    await db.em.persistAndFlush(poll);

    if (interaction) {
      await interaction.update({
        embeds: [this.buildEmbed(poll)],
        components: this.buildButtons(poll),
      });
    } else {
      const channel = (await bot.client.channels.fetch(poll.channel)) as TextChannel;
      const message = await channel.messages.fetch(poll.message);

      await message.edit({
        embeds: [this.buildEmbed(poll)],
        components: this.buildButtons(poll),
      });
    }
  }

  public async handleButton(interaction: ButtonInteraction): Promise<void> {
    const poll = PollModule.getPollModule().getPoll(interaction.customId.split("_")[1]);
    if (!poll) return;
    const option = Object.keys(poll.options)[parseInt(interaction.customId.split("_")[2])];

    await PollModule.getPollModule().vote(poll, option, interaction.user.id, interaction);
  }
}
