import Instruction from "./instruction";

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
    return ins;
  }

  public static clearInstructions(serverId: string) {
    this.instructions = this.instructions.filter((instruction) => instruction.serverId !== serverId);
  }
}
