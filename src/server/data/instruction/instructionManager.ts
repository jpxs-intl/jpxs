import Logger from "../../../utils/logger";
import Instruction from "./instruction";
import ExecInstruction from "./types/execInstruction";

export default class InstructionManager {
  public static instructions: Instruction[] = [];
  public static awaitingResponses: (Instruction & { resolve: (response: string) => void })[] = [];

  public static addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  public static addInstructionWithResponse(instruction: Instruction): Promise<string> {
    Logger.debug("InstructionManager", `Adding ${instruction.type} instruction with response, id: ${instruction.id} | serverId: ${instruction.serverId}`);
    this.instructions.push(instruction);
    return new Promise((resolve) => {
      this.awaitingResponses.push({ ...instruction, resolve });
    });
  }

  public static getInstructions(serverId: string) {
    return this.instructions.filter((instruction) => instruction.serverId === serverId);
  }

  public static getInstructionsToExecute(serverId: string) {
    const ins = this.getInstructions(serverId);
    this.clearInstructions(serverId);
    return ins;
  }

  public static clearInstructions(serverId: string) {
    this.instructions = this.instructions.filter((instruction) => instruction.serverId !== serverId);
  }

  public static handleInstructionResponse(data: {
    serverId: string;
    instructionId: string;
    response: string;
  }) {
    const instruction = this.awaitingResponses.find(
      (instruction) => instruction.serverId === data.serverId && instruction.id === data.instructionId
    );

    Logger.info("InstructionManager", `Instruction response received: ${data.response}`);

    if (instruction) {
      instruction.resolve(data.response);
      this.awaitingResponses = this.awaitingResponses.filter(
        (instruction) => instruction.serverId !== data.serverId && instruction.id !== data.instructionId
      );
    }
  }
}
