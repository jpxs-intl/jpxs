import Instruction from "../instruction";

export default class BanInstruction extends Instruction {
  public gameId: number;
  public reason: string;
  public admin: string;
  public duration: number;
  public timestamp: number;

  constructor(
    serverId: string,
    options: {
      gameId: number;
      reason: string;
      admin: string;
      duration: number;
      timestamp: number;
    }
  ) {
    super("UNBAN", serverId);
    this.gameId = options.gameId;
    this.reason = options.reason;
    this.admin = options.admin;
    this.duration = options.duration;
    this.timestamp = options.timestamp;
  }
}
