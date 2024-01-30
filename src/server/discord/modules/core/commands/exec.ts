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

const Command = new SlashCommandBuilder()
  .setName("exec")
  .setDescription("Run a command on a jpxs server")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("server")
      .setDescription("The server to run the command on")
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
      .setDescription("The code to run, type 'modal' to open a modal to edit the code instead")
      .setRequired(true)
  )
  .setFunction(async (interaction) => {
    const serverId = interaction.options.getString("server", true);
    const command = interaction.options.getString("command", true);

    const serverName = DataStorage.servers.find((server) => server.id === serverId)?.name;

    const allowedUsers = ["181507924571455499", "232510731067588608"];

    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: "You are not allowed to use this command",
        ephemeral: true,
      });
      return;
    }

    const server = DataStorage.serverData[serverId];

    if (!server) {
      await interaction.reply({
        content: "Server not found",
        ephemeral: true,
      });
      return;
    }

    if (command === "modal") {
      const modal = new ModalBuilder()
        .setTitle("Edit code")
        .setCustomId(`editCode-${interaction.id}`)
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("code")
              .setPlaceholder("return 'Hello world!';")
              .setRequired(true)
              .setStyle(TextInputStyle.Paragraph)
              .setLabel("Code")
          )
        );

      bot.modalManager.registerModal(`editCode-${interaction.id}`, async (interaction) => {
        const code = interaction.fields.getTextInputValue("code");

        if (!code) {
          await interaction.reply({
            content: "Invalid code",
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Running...")
              .setDescription("Your code has been queued to send... <a:jpxsloading:1128495600694997106>")
              .setColor(Colors.Yellow),
          ],
          ephemeral: false,
        });

        const now = Date.now();

        Logger.debug("command: exec", `Running code on ${serverName}:\n${code}`);

        const result = await Promise.race([
          InstructionManager.addInstructionWithResponse(
            new ExecInstruction(serverId, { code })
          ),
          new Promise((resolve) => {
            setTimeout(() => {
              resolve("Timed out");
            }, 20000);
          }),
        ])

        Logger.debug(
          "command: exec",
          `Ran code on ${serverName}:\n${command} | Result:\n${Util.stringify(result)}`
        );

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setTitle(result === "Timed out" ? "Timed out" : "Executed")
            .setDescription("```" + Util.stringify(result) + "```")
            .setColor(result === "Timed out" ? Colors.Red : Colors.Green)
            .setFooter({ text: `Took ${time(Date.now() - now).toString(true)} | Ran on ${serverName}` }),
          ],
        });
      });

      await interaction.showModal(modal);
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Running...")
          .setDescription("Your code has been queued to send... <a:jpxsloading:1128495600694997106>")
          .setColor(Colors.Yellow),
      ],
      ephemeral: false,
    });

    const now = Date.now();

    Logger.debug("command: exec", `Running code on ${serverName}:\n${command}`);

    const result = await Promise.race([
      InstructionManager.addInstructionWithResponse(
        new ExecInstruction(serverId, { code: command })
      ),
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("Timed out");
        }, 20000);
      }),
    ])

    Logger.debug(
      "command: exec",
      `Ran code on ${serverName}:\n${command} | Result:\n${Util.stringify(result)}`
    );

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(result === "Timed out" ? "Timed out" : "Executed")
        .setDescription("```" + Util.stringify(result) + "```")
        .setColor(result === "Timed out" ? Colors.Red : Colors.Green)
        .setFooter({ text: `Took ${time(Date.now() - now).toString(true)} | Ran on ${serverName}` }),
      ],
    });
  });

export default Command;
