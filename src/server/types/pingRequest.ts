export default interface PingRequest {
  uptime: number;
  serverId: string;
  tps: number;
  players: {
    subRosaId: number;
    team: number;
    corp: number;
    money: number;
  }[];
}
