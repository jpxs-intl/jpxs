import Instruction from "../instruction";

export default class ExecInstruction extends Instruction {
  public code: string;

  constructor(
    serverId: string,
    options: {
      code: string;
    }
  ) {
    super("EXEC", serverId);
    this.code = options.code;
  }
}
