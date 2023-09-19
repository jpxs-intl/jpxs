import Instruction from "../instruction";

export default class AnnounceInstruction extends Instruction {
  public message: string;

  constructor(
    serverId: string,
    options: {
      message: string;
    }
  ) {
    super("ANNOUNCE", serverId);
    this.message = options.message;
  }
}
