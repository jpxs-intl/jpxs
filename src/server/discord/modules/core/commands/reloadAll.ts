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
import ReloadInstruction from "../../../../data/instruction/types/reloadInstruction";
  
  const Command = new SlashCommandBuilder()
    .setName("reloadall")
    .setDescription("Reload the jpxs plugin on all servers")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
  
      const state = await reloadAll(interaction);
  
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
  
  async function reloadAll(interaction: ChatInputCommandInteraction | ModalSubmitInteraction) {
    let finishedCount = 0;
    const state: {
      [key: string]: {
        name: string;
        result: string;
        finished: boolean;
      };
    } = {};
  
    Object.keys(DataStorage.serverData).forEach((server) => {
      const serverData = DataStorage.servers.find((v) => v.id == server);
      if (!serverData) return;
      state[serverData.id] = {
        name: serverData.name,
        result: "",
        finished: false,
      };
    });
  
    const total = Object.keys(state).length;
  
    await Promise.race([
      Promise.all(
        Object.keys(DataStorage.serverData).map(async (serverId) =>
          Promise.race<string>([
            InstructionManager.addInstructionWithResponse(new ReloadInstruction(serverId)),
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("Timed out");
              }, 20000);
            }),
          ]).then(async (result) => {
            if (!state[serverId]) return;
            state[serverId].result = result;
            state[serverId].finished = true;
  
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Running...")
                  .setDescription(
                    `Reload instruction has been received by ${++finishedCount}/${total} servers... <a:jpxsloading:1128495600694997106> \n \n ${Object.keys(
                      state
                    )
                      .map((key) => {
                        const server = state[key];
                        return `${server.finished ? (server.result == "Timed Out" ? "🔴" : "🟢") : "🟡"} ${
                          server.name
                        }: ${server.finished ? server.result : "Waiting..."}`;
                      })
                      .join("\n")}`
                  )
                  .setColor(Colors.Yellow),
              ],
            });
  
            return result;
          })
        )
      ),
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("Timed out");
        }, 20000);
      }),
    ]);
  
    return state;
  }
  