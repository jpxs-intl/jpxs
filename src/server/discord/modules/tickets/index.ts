import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  Colors,
  EmbedBuilder,
  GuildTextBasedChannel,
  ModalBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { bot, db } from "../../core";
import Module from "../../core/base/module";
import Ticket from "./entities/ticket.entity";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export default class TicketsModule extends Module {
  public name = "tickets";
  public description = "No description provided";

  public ticketCache: Map<string, Ticket> = new Map();
  public questionCache: Map<string, TicketType> = new Map();

  public static getTicketsModule(): TicketsModule {
    return bot.moduleLoader.getModule("tickets") as TicketsModule;
  }

  public override async onLoad(): Promise<boolean> {
    await this.loadTickets();
    this.loadQuestions();

    bot.buttonManager.registerButton("open-ticket", async (interaction) => {
      interaction.reply({
        components: [this.createTicketMenu(`ticket-${interaction.user.id}-open`)],
        embeds: [
          new EmbedBuilder()
            .setTitle("Open a Ticket")
            .setDescription("Please select a category to open a ticket!")
            .setColor(Colors.Blue),
        ],
        ephemeral: true,
      });
    });

    return true;
  }

  public async createTicket(userId: string, channelId: string): Promise<Ticket> {
    const ticket = new Ticket();
    ticket.userId = userId;
    ticket.channelId = channelId;
    ticket.closed = false;

    const ticketEntity = db.getEntityManager().create(Ticket, ticket);
    await db.getEntityManager().persistAndFlush(ticketEntity);

    this.ticketCache.set(channelId, ticketEntity);

    return ticketEntity;
  }

  public async openTicket(userId: string, ticketType: string, answers: Answers): Promise<Ticket> {
    const category = bot.client.channels.cache.get("1117281496189911103") as CategoryChannel;
    if (!category) throw new Error("Could not find category channel!");

    const ticketData = this.questionCache.get(ticketType) as TicketType;
    const user = await bot.client.users.fetch(userId);

    const channel = await category.guild.channels.create({
      name: `${ticketData.name}-${user.username}`,
      parent: category,
      type: ChannelType.GuildText,
      topic: `${ticketData.name} ticket for ${user.username} (${user.id})`,
      permissionOverwrites: [
        {
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
          id: userId,
        },
        {
          deny: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
          id: category.guild.id,
        },
      ],
    });

    const ticket = await this.createTicket(userId, channel.id);

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Ticket ${ticket.id}`)
          .setDescription(
            [
              `Ticket opened by ${user.toString()}`,
              "",
              `**Category:** ${ticketData.name}`,
              "",
              `**Answers:**`,
              Object.keys(answers)
                .map(
                  (key) => `**${ticketData.questions.find((q) => q.id == key)?.question}**: ${answers[key]}`
                )
                .join("\n\n"),
            ].join("\n")
          )
          .setColor(Colors.Green),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`ticket-${ticket.id}-close`)
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    bot.buttonManager.registerButton(`ticket-${ticket.id}-close`, async (interaction) => {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket Closed")
            .setDescription("Ticket closing... Please wait!")
            .setColor(Colors.Red),
        ],
        components: [],
      });

      setTimeout(async () => {
        // move to archive category
        const archiveCategory = bot.client.channels.cache.get("1118622760143421451") as CategoryChannel;
        if (!archiveCategory) throw new Error("Could not find archive category channel!");

        const channel = interaction.channel as GuildTextBasedChannel;
        await channel.edit({
          parent: archiveCategory,
          permissionOverwrites: [{
            deny: [
              PermissionFlagsBits.ViewChannel,  
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
            id: channel.guild.id,
          }],
        });

        await this.closeTicket(ticket.channelId);
      }, 5000);
    });

    return ticket;
  }

  public async closeTicket(channelId: string): Promise<void> {
    const ticket = await this.getTicket(channelId);
    if (!ticket) return;

    ticket.closed = true;
    await db.getEntityManager().persistAndFlush(ticket);
    this.ticketCache.delete(channelId);
  }

  public async getTicket(channelId: string): Promise<Ticket | undefined> {
    if (this.ticketCache.has(channelId)) return this.ticketCache.get(channelId);

    const ticket = await db.getEntityManager().findOne(Ticket, {
      channelId,
    });

    if (ticket) this.ticketCache.set(channelId, ticket);
    return ticket ?? undefined;
  }

  public async isTicket(channelId: string): Promise<boolean> {
    return (await this.getTicket(channelId)) !== undefined;
  }

  public async loadTickets(): Promise<void> {
    const tickets = await db.getEntityManager().find(Ticket, {
      closed: false,
    });
    tickets.forEach((t) => {
      this.ticketCache.set(t.channelId, t);

      bot.buttonManager.registerButton(`ticket-${t.id}-close`, async (interaction) => {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Ticket Closed")
              .setDescription("Ticket closing... Please wait!")
              .setColor(Colors.Red),
          ],
          components: [],
        });

        setTimeout(async () => {
          // move to archive category
          const archiveCategory = bot.client.channels.cache.get("1118622760143421451") as CategoryChannel;
          if (!archiveCategory) throw new Error("Could not find archive category channel!");

          const channel = interaction.channel as GuildTextBasedChannel;
          await channel.edit({
            parent: archiveCategory,
            permissionOverwrites: [
              {
                deny: [
                  PermissionFlagsBits.ViewChannel,  
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
                id: channel.guild.id,
              }
            ],
          });

          await this.closeTicket(t.channelId);
        }, 5000);
      });
    });
  }

  public loadQuestions(): void {
    const filePath = resolve("./src/server/discord/modules/tickets/questions.json");

    if (!existsSync(filePath)) {
      throw new Error("Questions file doesn't exist! Please create one!");
    }

    const questions: TicketType[] = JSON.parse(readFileSync(filePath, "utf-8"));
    questions.forEach((q) => this.questionCache.set(q.id, q));
  }

  public createTicketMenu(id: string): ActionRowBuilder<StringSelectMenuBuilder> {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>();
    const menu = new StringSelectMenuBuilder();

    Array.from(this.questionCache.values()).forEach((ticketType) => {
      menu.addOptions({
        value: ticketType.id,
        label: ticketType.name,
        description: ticketType.description,
        emoji: ticketType.emoji,
      });

      menu.setCustomId(id);
      menu.setMaxValues(1);
      menu.setPlaceholder("Select a Category!");
    });

    row.addComponents(menu);

    bot.selectMenuManager.registerMenu(id, async (interaction) => {
      const ticketType = interaction.values[0];
      await this.openModal(interaction, ticketType);
    });
    return row;
  }

  public async openModal(interaction: StringSelectMenuInteraction, ticketType: string) {
    const ticketData = this.questionCache.get(ticketType) as TicketType;

    const modal = new ModalBuilder();

    ticketData.questions.forEach((question) => {
      const row = new ActionRowBuilder<TextInputBuilder>();
      const input = new TextInputBuilder();

      input.setCustomId(question.id);
      input.setLabel(question.question);
      input.setPlaceholder(question.placeholder);
      input.setMinLength(1);
      input.setMaxLength(1024);
      input.setRequired(question.required);
      input.setStyle(question.type);

      row.setComponents(input);
      modal.addComponents(row);
    });

    modal.setCustomId(`ticket-${interaction.user.id}-modal`);
    modal.setTitle(`Open a ${ticketData.name} Ticket`);

    bot.modalManager.registerModal(`ticket-${interaction.user.id}-modal`, async (interaction) => {
      const answers: Answers = {};
      const ticketData = this.questionCache.get(ticketType) as TicketType;

      ticketData.questions.forEach((question) => {
        answers[question.id] = interaction.fields.getTextInputValue(question.id);
      });

      const ticket = await this.openTicket(interaction.user.id, ticketType, answers);
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket Opened")
            .setDescription(
              `Your ticket has been opened! \n\n<#${ticket.channelId}>\n\nA team member will get back to you soon.`
            )
            .setColor(Colors.Green),
        ],
      });
    });

    await interaction.showModal(modal);
  }
}

interface TicketType {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  placeholder: string;
  type: TextInputStyle;
  required: boolean;
}

interface Answers {
  [key: string]: string;
}
