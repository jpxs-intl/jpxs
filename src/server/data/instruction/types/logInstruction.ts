import Instruction from "../instruction";

export default class LogInstruction extends Instruction {
  public message: string;

  constructor(
    serverId: string,
    options: {
      message: string;
    }
  ) {
    super("LOG", serverId);
    this.message = options.message;
  }
}
