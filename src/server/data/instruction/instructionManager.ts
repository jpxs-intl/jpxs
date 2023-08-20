import Instruction from "./instruction";
import ExecInstruction from "./types/execInstruction";

export default class InstructionManager {
  public static instructions: Instruction[] = [];
  public static awaitingResponses: (Instruction & { resolve: (response: string) => void })[] = [];

  public static addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  public static addInstructionWithResponse(instruction: Instruction): Promise<string> {
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

    if (serverId == "clgg01c9a141vm13185c63rmi") {
      const res = this.addInstructionWithResponse(
        new ExecInstruction(serverId, {
          code: "return server.name;",
        })
      );

      res.then((response) => {
        console.log("Response:");
        console.log(response);
      });
    }

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

    if (instruction) {
      instruction.resolve(data.response);
      this.awaitingResponses = this.awaitingResponses.filter(
        (instruction) => instruction.serverId !== data.serverId && instruction.id !== data.instructionId
      );
    }
  }
}
