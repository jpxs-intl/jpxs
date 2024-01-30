import {
  ActionRow,
  ActionRowBuilder,
  Colors,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputComponent,
  TextInputStyle,
} from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";
import DataStorage from "../../../../data/dataStorage";
import { bot } from "../../../core";
import InstructionManager from "../../../../data/instruction/instructionManager";
import ExecInstruction from "../../../../data/instruction/types/execInstruction";
import Util from "../../../../../utils/util";
import Logger from "../../../core/utils/logger";
import AnnounceInstruction from "../../../../data/instruction/types/announceInstruction";

const Command = new SlashCommandBuilder()
  .setName("announce1")
  .setDescription("Send an announcement to one server")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("server")
      .setDescription("The server to post the message on")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const servers = DataStorage.servers.filter(
          (server) =>
            server.name?.toLowerCase().includes(input.toLowerCase()) && DataStorage.serverData[server.id]
        );

        return new Promise((resolve) => {
          resolve(
            servers
              .map((server) => ({
                name: server.name || "Unknown",
                value: server.id,
              }))
              .slice(0, 25)
          );
        });
      })
  )
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("The message to post")
      .setRequired(true)
  )
  .setFunction(async (interaction) => {
    const serverId = interaction.options.getString("server", true);
    const message = interaction.options.getString("command", true);

    const serverName = DataStorage.servers.find((server) => server.id === serverId)?.name;
    const server = DataStorage.serverData[serverId];

    if (!server) {
      await interaction.reply({
        content: "Server not found",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Running...")
          .setDescription("Your announcement has been queued to send... <a:jpxsloading:1128495600694997106>")
          .setColor(Colors.Yellow),
      ],
      ephemeral: false,
    });

    const now = Date.now();

    Logger.debug("command: announce", `Running code on ${serverName}:\n${message}`);

    const result = await Promise.race([
      InstructionManager.addInstructionWithResponse(
        new AnnounceInstruction(serverId, { message })
      ),
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("Timed out");
        }, 20000);
      }),
    ])

    Logger.debug(
      "command: announce",
      `Posted announcement on ${serverName}:\n${message} | Result:\n${Util.stringify(result)}`
    );

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(result === "Timed out" ? "Timed out" : "Anounced")
        .setDescription("```" + Util.stringify(result) + "```")
        .setColor(result === "Timed out" ? Colors.Red : Colors.Green)
        .setFooter({ text: `Took ${time(Date.now() - now).toString(true)} | Ran on ${serverName}` }),
      ],
    });
  });

export default Command;
