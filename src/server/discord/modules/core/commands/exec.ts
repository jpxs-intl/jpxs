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
        const servers = Object.keys(DataStorage.serverData)
          .map((key) => {
            const server = DataStorage.serverData[key];
            const masterServerData = DataStorage.servers.find((s) => s.id === server.serverId);
            return {
              serverId: server.serverId,
              name: masterServerData?.name,
            };
          })
          .filter((server) => server.name?.toLowerCase().includes(input.toLowerCase()));

        return new Promise((resolve) => {
          resolve(
            servers
              .map((server) => ({
                name: server.name || "Unknown",
                value: server.serverId,
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

    await interaction.deferReply();

    const serverId = interaction.options.getString("server", true);
    const command = interaction.options.getString("command", true);

    const server = DataStorage.serverData[serverId];

    if (!server) {
      await interaction.editReply({
        content: "Server not found",
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

        const result = await InstructionManager.addInstructionWithResponse(
          new ExecInstruction(serverId, { code })
        );

        await interaction.editReply({
          content: "```" + result + "```",
        });
      });

      await interaction.showModal(modal);
      return;
    }

    const result = await InstructionManager.addInstructionWithResponse(
      new ExecInstruction(serverId, { code: command })
    );

    await interaction.editReply({
      content: "```" + result + "```",
    });
  });

export default Command;
