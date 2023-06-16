import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import fetch from "node-fetch";

const Command = new SlashCommandBuilder()
  .setName("player")
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
            const res = (await fetch(`https://jpxs.international/api/player/autocomplete/${query}`).then(
              (res) => res.json()
            )) as {
              success: boolean;
              players: {
                nameHistory: string;
                gameId: number;
                phoneNumber: number;
              }[];
            };

            if (!res.success) return [];

            return res.players.map((player) => ({
              name: `${player.nameHistory} (${player.phoneNumber.toString().replace(/(\d{3})(\d{4})/, "$1-$2")})`,
              value: player.nameHistory,
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

async function lookup(ident: string) {
  const res = (await fetch(`https://jpxs.international/api/player/${ident}`).then((res) => res.json())) as {
    success: boolean;
    requestTime: number;
    searchMode: string;
    players: {
      name: string;
      description: string;
      gameId: number;
      phoneNumber: number;
      discordId: string;
      steamId: string;
      firstSeen: string;
      lastSeen: string;
      nameHistory: {
        id: string;
        date: string;
        name: string;
      }[];
      avatarHistory: any[];
    }[];
  };

  if (!res.success) return null;

  return res.players[0];
}

async function embed(ident: string, interaction: ChatInputCommandInteraction) {
  const player = await lookup(ident);
  if (!player) return interaction.reply("Player not found");

  const embed = new EmbedBuilder()
    .setTitle(player.name)
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
      {
        name: "Name History",
        value: player.nameHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(
        )).map((name, index) => `${index}. \`${name.name}\``).reverse().join("\n") ?? "Unknown",
        inline: true,

      },
    ]);

  return interaction.reply({
    embeds: [embed],
  });
}
