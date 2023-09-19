import Instruction from "../instruction";

export default class SaveInstruction extends Instruction {
  constructor(serverId: string) {
    super("SAVE", serverId);
  }
}
