import Instruction from "./instruction";
import ExecInstruction from "./types/execInstruction";

export default class InstructionManager {
  public static instructions: Instruction[] = [];

  public static addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  public static getInstructions(serverId: string) {
    return this.instructions.filter((instruction) => instruction.serverId === serverId);
  }

  public static getInstructionsToExecute(serverId: string) {
    const ins = this.getInstructions(serverId);
    this.clearInstructions(serverId);

    if (serverId == "clgg01c9a141vm13185c63rmi") {
      ins.push(
        new ExecInstruction("clgg01c9a141vm13185c63rmi", {
          code: "print('Hello World!')",
        })
      );
    }

    return ins;
  }

  public static clearInstructions(serverId: string) {
    this.instructions = this.instructions.filter((instruction) => instruction.serverId !== serverId);
  }
}
