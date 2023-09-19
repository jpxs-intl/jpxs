import Instruction from "../instruction";

export default class ShutdownInstruction extends Instruction {
  constructor(serverId: string) {
    super("SHUTDOWN", serverId);
  }
}
