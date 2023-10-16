import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
} from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";
import DataStorage from "../../../../data/dataStorage";
import InstructionManager from "../../../../data/instruction/instructionManager";
import AnnounceInstruction from "../../../../data/instruction/types/announceInstruction";
import RejoinInstruction from "../../../../data/instruction/types/rejoinInstruction";

const Command = new SlashCommandBuilder()
  .setName("rejoin")
  .setDescription("Resend all player data to the main server")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setFunction(async (interaction) => {


    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Running...")
          .setDescription("Instruction has been queued to send... <a:jpxsloading:1128495600694997106>")
          .setColor(Colors.Yellow),
      ],
      ephemeral: false,
    });

    const now = Date.now();

    const state = await rejoin(interaction);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Executed")
          .setDescription(
            `Announcement has been sent to ${Object.keys(state).length} servers! \n \n ${Object.keys(state)
              .map((key) => {
                const server = state[key];
                return `${server.finished ? (server.result == "Timed Out" ? "🔴" : "🟢") : "🟡"} ${server.name
                  }: ${server.finished ? server.result : "Waiting..."}`;
              })
              .join("\n")}`
          )
          .setColor(Colors.Green)
          .setFooter({
            text: `Took ${time(Date.now() - now).toString(true)}`,
          }),
      ],
    });
  });

export default Command;

async function rejoin(interaction: ChatInputCommandInteraction | ModalSubmitInteraction) {
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
          InstructionManager.addInstructionWithResponse(
            new RejoinInstruction(serverId)
          ),
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
                  `Rejoin instruction has been received by ${++finishedCount}/${total} servers... <a:jpxsloading:1128495600694997106> \n \n ${Object.keys(
                    state
                  )
                    .map((key) => {
                      const server = state[key];
                      return `${server.finished ? (server.result == "Timed Out" ? "🔴" : "🟢") : "🟡"} ${server.name
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
