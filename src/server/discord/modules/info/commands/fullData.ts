import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import CacheStorage from "../../../../database/cacheStorage";
import { User } from "../../../../../database/entities/user.entity";
import Logger from "../../../core/utils/logger";
import { db } from "../../../core";
import { Ip } from "../../../../../database/entities/ip.entity";
import PlayerStatus from "../../../../../database/entities/playerStatus.entity";
import PagedEmbed from "../../../../../utils/pagedEmbed";
import Utils from "../../../core/utils/utils";
import { Avatar } from "../../../../../database/entities/avatar.entity";
import Time from "../../../core/utils/time";

const Command = new SlashCommandBuilder()
  .setName("fulldata")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription("Get information about a player")
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

  await interaction.deferReply({
    ephemeral: true,
  });

  const ips = await db.getEntityManager().find(Ip, {
    users: {
      phoneNumber: player.phoneNumber,
    },
  });

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

  const stats = await db.getEntityManager().find(PlayerStatus, {
    user: player,
  });

  let servers: {
    [key: string]: PlayerStatus[];
  } = {};

  stats.forEach((stat) => {
    if (servers.hasOwnProperty(stat.server.id)) {
      servers[stat.server.id].push(stat);
    } else {
      servers[stat.server.id] = [stat];
    }
  });

  for (const server in servers) {
    servers[server].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  let serverData = await Promise.all(
    Object.keys(servers).map(async (k) => {
      return {
        id: k,
        data: servers[k],
        name: (await CacheStorage.snapshots.getServerName(k)) ?? "Unknown Server",
        address: `${(await CacheStorage.servers.get(k))?.address}:${
          (await CacheStorage.servers.get(k))?.port
        }`,
      };
    })
  ).then((v) => v.sort((a, b) => b.data.length - a.data.length));

  new PagedEmbed(
    interaction,
    async (page) => {
      if (page == 0) {
        // basic info
        const embed = new EmbedBuilder()
          .setTitle(`${await player.getName()} | Basic Info`)
          .setColor(Colors.Green)
          .setFields([
            {
              name: "Game ID",
              value: player.gameId.toString(),
              inline: true,
            },
            {
              name: "Phone Number",
              // xxx-xxxx
              value: player.phoneNumber.toString().replace(/(\d{3})(\d{4})/, "$1-$2"),
              inline: true,
            },
            {
              name: "Discord ID",
              value: player.discordId ?? "Unknown",
              inline: true,
            },
            {
              name: "Steam ID",
              value: player.steamId ?? "Unknown",
              inline: true,
            },
            {
              name: "First Seen",
              value: `<t:${Math.floor(new Date(player.firstSeen).getTime() / 1000)}:R> (<t:${Math.floor(
                new Date(player.firstSeen).getTime() / 1000
              )}:F>)`,
              inline: true,
            },
            {
              name: "Last Seen",
              value: `<t:${Math.floor(new Date(player.lastSeen).getTime() / 1000)}:R> (<t:${Math.floor(
                new Date(player.lastSeen).getTime() / 1000
              )}:F>)`,
              inline: true,
            },
          ]);

        return embed;
      } else if (page == 1) {
        // name history
        const embed = new EmbedBuilder()
          .setTitle(`${await player.getName()} | Name History`)
          .setColor(Colors.Green)
          .setDescription(
            player.nameHistory
              .getItems()
              .map((v, i) => `${i}. \`${v.name}\` ${Utils.discordTimestamp(v.date, "longDateTime")}`)
              .join("\n")
          );

        return embed;
      } else if (page == 2) {
        // avatar history

        const desc = player.avatarHistory
          .getItems()
          .map(
            (v, i) =>
              `${i}. [View](${Avatar.getOXSAvatarUrl(v.avatar, {
                antiAliasing: true,
                backgroundColor: "000000",
                body: false,
                embed: true,
              })}) ${Utils.discordTimestamp(v.date, "longDateTime")}`
          )
          .join("\n");

        const embed = new EmbedBuilder()
          .setTitle(`${await player.getName()} | Avatar History`)
          .setColor(Colors.Green)
          .setDescription(desc.length == 0 ? "No avatars found" : desc);

        return embed;
      } else if (page == 3) {
        // ip info
        const embed = new EmbedBuilder()
          .setTitle(`${await player.getName()} | IP Info`)
          .setColor(Colors.Green)
          .setDescription(
            users
              .filter((u) => u.ip)
              .map((u) => {
                return `**${u.ip}**: \n\t${u.users.map((v) => `${v.name} (${v.phoneNumber})`).join("\n\t")}`;
              })
              .join("\n")
          );
        return embed;
      } else {
        // server stats
        const embed = new EmbedBuilder()
          .setTitle(
            `${await player.getName()} - ${serverData[page - 4].name ?? "Unknown"} (${
              serverData[page - 4].address
            })`
          )
          .setColor(Colors.Green)
          .setDescription(
            [
              `**Frames**: ${serverData[page - 4].data.length}`,
              `**Balance**: ${serverData[page - 4].data[0].money}`,
              `**Corp**: ${serverData[page - 4].data[0].corp}`,
              `**Playtime**: ${new Time(serverData[page - 4].data.length * 15000).toString(true)}`,
            ].join("\n")
          );
        return embed;
      }
    },
    {
      pageCount: 3 + serverData.length,
      refreshButton: false,
      firstSendEdit: true,
      footer: true,
    }
  );
}
