import {
  ActionRow,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
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
  .setName("execall")
  .setDescription("Run a command on all jpxs servers")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("The code to run, type 'modal' to open a modal to edit the code instead")
      .setRequired(true)
  )
  .setFunction(async (interaction) => {
    const command = interaction.options.getString("command", true);

    const allowedUsers = ["181507924571455499", "232510731067588608"];

    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: "You are not allowed to use this command",
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

        const state = await execAll(code, interaction);

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Executed")
              .setDescription(
                Object.values(state)
                  .map((server) => `**${server.name}**: \`\`\`${server.result}\`\`\``)
                  .join("\n")
              )
              .setColor(Colors.Green)
              .setFooter({
                text: `Took ${time(Date.now() - now).toString(true)}`,
              }),
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

    const state = await execAll(command, interaction);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Executed")
          .setDescription(
            Object.values(state)
              .map((server) => `**${server.name}**: \`\`\`${server.result}\`\`\``)
              .join("\n")
          )
          .setColor(Colors.Green)
          .setFooter({
            text: `Took ${time(Date.now() - now).toString(true)}`,
          }),
      ],
    });
  });

export default Command;

async function execAll(code: string, interaction: ChatInputCommandInteraction | ModalSubmitInteraction) {
  const now = Date.now();
  let finishedCount = 0;
  const total = Object.keys(DataStorage.serverData).length;
  const state: {
    [key: string]: {
      name: string;
      result: string;
      finished: boolean;
    };
  } = {};

  DataStorage.servers.forEach((server) => {
    state[server.id] = {
      name: server.name,
      result: "",
      finished: false,
    };
  });

  await Promise.all(
    Object.keys(DataStorage.serverData).map(async (serverId) =>
      Promise.race<string>([
        InstructionManager.addInstructionWithResponse(new ExecInstruction(serverId, { code })),
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("Timed out");
          }, 20000);
        }),
      ]).then(async (result) => {
        state[serverId].result = result;
        state[serverId].finished = true;

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Running...")
              .setDescription(
                `Your code has been received by ${++finishedCount}/${total} servers... <a:jpxsloading:1128495600694997106> \n \n ${Object.keys(
                  state
                )
                  .map((key) => {
                    const server = state[key];
                    return `${server.name}: ${server.finished ? "Finished" : "Running"}`;
                  })
                  .join("\n")}`
              )
              .setColor(result === "Timed out" ? Colors.Red : Colors.Green)
              .setFooter({
                text: `Took ${time(Date.now() - now).toString(true)} | Ran on ${
                  DataStorage.servers.find((v) => v.id == serverId)?.name
                }`,
              }),
          ],
        });

        return result;
      })
    )
  );

  return state;
}
