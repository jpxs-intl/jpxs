import { ServerData } from "sub-rosa-servers";
import ServerDatabaseManager from "../database/serverDatabaseManager";
import { FullServerData } from "../../assets/web/scripts/socket/messages";
import PingRequest from "../types/pingRequest";
import VPNCheck from "./vpnCheck";
import CacheStorage from "../database/cacheStorage";

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
      sentPatch: boolean;

      icon: string;
      link: string;
      description?: string;
      region?: string;
      emoji?: string;
    };
  } = {};
  public static regionCache: {
    [address: string]: {
      country: string;
      emoji: string;
    }
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

          this.getServerRegion(server.address, server.port);

          resolve({
            ...server,
            id: entity ? entity.id : "unknown",
          });
        });
      })
    )
  }

  public static async getServerRegion(address: string, port: number) {

    const serverId = await CacheStorage.addressMap.get({
      address,
      port
    })

    const res = this.regionCache[address] || await VPNCheck.check(address).then((res) => {
      this.regionCache[address] = {
        country: res.location.country,
        emoji: DataStorage.getFlagEmoji(res.location.country_code)
      }
      return {
        country: res.location.country,
        emoji: DataStorage.getFlagEmoji(res.location.country_code)
      }
    })

    if (serverId && DataStorage.serverData[serverId]) {
      DataStorage.serverData[serverId].region = res.country;
      DataStorage.serverData[serverId].emoji = res.emoji;
    }

  }

  public static getFlagEmoji(countryCode: string) {
    const flagOffset = 0x1F1E6;
    const asciiOffset = 0x41;

    const firstChar = countryCode.charCodeAt(0) - asciiOffset + flagOffset;
    const secondChar = countryCode.charCodeAt(1) - asciiOffset + flagOffset;

    return String.fromCodePoint(firstChar, secondChar);
  }

}

