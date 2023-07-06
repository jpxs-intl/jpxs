export default interface InitRequest {
  name: string;
  icon: string;
  description: string;
  link: string;
  port: number;
  gameType: number;
  bans: {
    name: string;
    subRosaId: number;
  }[];
}
