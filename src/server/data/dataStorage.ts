import { ServerData } from "sub-rosa-servers";
import ServerDatabaseManager from "../database/serverDatabaseManager";
import { FullServerData } from "../../assets/web/scripts/socket/messages";
import PingRequest from "../types/pingRequest";

export default class DataStorage {
  public static servers: FullServerData[] = [];
  public static serverData: {
    [serverId: string]: 
    PingRequest & {
      tps: number;
      mode: {
        enabled: boolean;
        name: string | null;
        description: string | null;
        author: string | null;
      },
      map: string;
    };
  } = {};

  public static async updateServers(
    servers: (ServerData & {
      masterServer: "vanilla" | "RosaClassic";
    })[]
  ) {

    DataStorage.servers = await Promise.all(
      servers.map(async (server) => {
        return new Promise<FullServerData>(async (resolve) => {
          const entity = await ServerDatabaseManager.getServer(
            server.address,
            server.port,
            server.identifier
          );

          resolve({
            ...server,
            id: entity ? entity.id : "unknown",
          });
        });
      })
    )
  }
}

