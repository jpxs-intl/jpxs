export default interface PingRequest {
  uptime: number;
  serverId: string;
  tps: number;
  map: string;
  players: {
    subRosaId: number;
    team: number;
    corp: number;
    money: number;
  }[];
}
