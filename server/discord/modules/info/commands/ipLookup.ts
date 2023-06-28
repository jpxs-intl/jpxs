import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import CacheStorage from "../../../../database/cacheStorage";
import { User } from "../../../../../database/entities/user.entity";
import Logger from "../../../core/utils/logger";
import { db } from "../../../../..";
import { Ip } from "../../../../../database/entities/ip.entity";

const Command = new SlashCommandBuilder()
  .setName("iplookup")
  .setDescription("Grab users with the same IP address")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("name")
      .setDescription("Get information about a player by name")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the player")
          .setRequired(true)
          .setAutocomplete(async (interaction, query) => {
            const players = await CacheStorage.playerAutoComplete.get(query);

            Logger.debug("Player", `Autocomplete query for ${query} returned ${players.length} results`);

            return players.slice(0, 25).map((player) => ({
              name: `${player.nameHistory.getItems()[0].name} (${player.phoneNumber
                .toString()
                .replace(/(\d{3})(\d{4})/, "$1-$2")})`,
              value: player.nameHistory.getItems()[0].name,
            }));
          })
      )
      .setFunction(async (interaction) => {
        const name = interaction.options.getString("name", true);
        await embed(name, interaction);
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("phone")
      .setDescription("Get information about a player by phone number")
      .addIntegerOption((option) =>
        option.setName("phone").setDescription("The phone number of the player").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const phone = interaction.options.getInteger("phone", true);
        await embed(phone.toString(), interaction);
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("discord")
      .setDescription("Get information about a player by Discord user")
      .addUserOption((option) =>
        option.setName("discord").setDescription("The Discord user of the player").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const discord = interaction.options.getUser("discord", true);
        await embed(discord.id, interaction);
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("steam")
      .setDescription("Get information about a player by Steam ID")
      .addStringOption((option) =>
        option.setName("steam").setDescription("The Steam ID of the player").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const steam = interaction.options.getString("steam", true);
        await embed(steam, interaction);
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("gameid")
      .setDescription("Get information about a player by game ID")
      .addIntegerOption((option) =>
        option.setName("gameid").setDescription("The game ID of the player").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const gameid = interaction.options.getInteger("gameid", true);
        await embed(gameid.toString(), interaction);
      })
  );

export default Command;

async function lookup(ident: string): Promise<User | undefined> {
  return await CacheStorage.users.identSearch(ident);
}

async function embed(ident: string, interaction: ChatInputCommandInteraction) {
  const player = await lookup(ident);
  if (!player) return interaction.reply("Player not found");

  const ips = await db.getEntityManager().find(Ip, {
    users: {
      phoneNumber: player.phoneNumber,
    },
  });

  try {
    let users: {
      ip: string;
      users: {
        name: string;
        phoneNumber: number;
      }[];
    }[] = [];

    for (const ip of ips) {
      if (!ip.users.isInitialized()) await ip.users.init();
      users.push({
        ip: ip.ip,
        users: await Promise.all(
          ip.users.getItems().map(async (user) => {
            if (!user.nameHistory.isInitialized()) await user.nameHistory.init();
            return {
              name: user.nameHistory.getItems()[0].name ?? "Unknown",
              phoneNumber: user.phoneNumber,
            };
          })
        ),
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(player.nameHistory.getItems()[0].name)
      .setColor(Colors.Green)
      .setFields(
        users.map((user) => ({
          name: user.ip,
          value: user.users
            .map((user) => `${user.name} (${user.phoneNumber.toString().replace(/(\d{3})(\d{4})/, "$1-$2")})`)
            .join("\n"),
        }))
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  } catch (e) {
    Logger.error("IP Lookup", e);
    // @ts-ignore
    return interaction.reply("An error occurred.\n```\n" /+ e.stack + "\n```");
  }
}
