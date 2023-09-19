import Instruction from "../instruction";

export default class RejoinInstruction extends Instruction {
  constructor(serverId: string) {
    super("REJOIN", serverId);
  }
}
