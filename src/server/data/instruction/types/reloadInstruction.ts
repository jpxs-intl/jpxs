import Instruction from "../instruction";

export default class ReloadInstruction extends Instruction {
  constructor(serverId: string) {
    super("RELOAD", serverId);
  }
}
