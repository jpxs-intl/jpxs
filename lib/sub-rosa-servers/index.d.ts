declare module 'sub-rosa-servers' {
  export interface ServerData {
    address: string;
    port: number;
    latency: number;
    buffer: Buffer;
    name: string;
    version: number;
    build: string;
    clientCompatability: number;
    passworded: boolean;
    identifier: number;
    gameType: number;
    players: number;
    maxPlayers: number;
  }
  function getServerList(masterServer: string): Promise<ServerData[]>;
  export = getServerList
}