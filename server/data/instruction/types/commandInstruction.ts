import Instruction from "../instruction";

export default class CommandInstruction extends Instruction {
  public command: string;

  constructor(
    serverId: string,
    options: {
      command: string;
    }
  ) {
    super("COMMAND", serverId);
    this.command = options.command;
  }
}
