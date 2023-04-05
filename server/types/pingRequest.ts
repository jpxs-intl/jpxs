export default interface PingRequest {
  uptime: number;
  serverId: string;
  players: {
    subRosaId: number;
    team: number;
    corp: number;
    money: number;
  }[];
}
