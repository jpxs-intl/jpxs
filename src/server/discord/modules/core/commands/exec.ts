import {
  ActionRow,
  ActionRowBuilder,
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
        const servers = DataStorage.servers.filter((server) =>
          server.name?.toLowerCase().includes(input.toLowerCase())
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

        await interaction.deferReply();

        const result = await InstructionManager.addInstructionWithResponse(
          new ExecInstruction(serverId, { code })
        );

        await interaction.editReply({
          content: "```" + Util.stringify(result) + "```",
        });
      });

      await interaction.showModal(modal);
      return;
    }

    await interaction.deferReply();

    const result = await InstructionManager.addInstructionWithResponse(
      new ExecInstruction(serverId, { code: command })
    );

    await interaction.editReply({
      content: "```" + Util.stringify(result) + "```",
    });
  });

export default Command;
