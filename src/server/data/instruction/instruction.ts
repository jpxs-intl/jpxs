export default class Instruction {
  public id: string;
  public serverId: string;
  public type: string;

  constructor(type: string, serverId: string) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.serverId = serverId;
    this.type = type;
  }
}
