import { ServerData } from "sub-rosa-servers";
import ServerDatabaseManager from "../database/serverDatabaseManager";
import { FullServerData } from "../../assets/web/scripts/socket/messages";
import PingRequest from "../types/pingRequest";
import VPNCheck from "./vpnCheck";
import CacheStorage from "../database/cacheStorage";
import Cache from "../database/cache/cache";
import { ms } from "../discord/core/utils/time";

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
    };
  } = {};
  public static regionCache: {
    [address: string]: {
      country: string;
      emoji: string;
    }
  } = {};

  public static playerIpCache = new Cache<{
    currentServerId: string;
    lastPing: number;
    data: PlayerStatusData;
  }>("time", ms("1h"));

  public static playerIdIpCache = new Cache<string, number>("time", ms("1d"));

  public static async updateServers(
    servers: (ServerData & {
      masterServer: "vanilla" | "jpxs";
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

          const regionData = await DataStorage.getServerRegion(server.address);

          resolve({
            ...server,
            id: entity ? entity.id : "unknown",
            region: regionData.country,
            emoji: regionData.emoji,
          });
        });
      })
    )
  }

  public static async getServerRegion(address: string) {


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

    return res;

  }

  public static updatePlayerLocation(ip: string, serverId: string, data: PlayerStatusData) {
    DataStorage.playerIpCache.set(ip, {
      currentServerId: serverId,
      lastPing: Date.now(),
      data
    });

    DataStorage.playerIdIpCache.set(data.subRosaId, ip);
  }

  public static updatePlayerLocations(serverId: string, players: PlayerStatusData[]) {
    players.forEach((player) => {
      const ip = DataStorage.playerIdIpCache.get(player.subRosaId)
      if (ip) {
        DataStorage.updatePlayerLocation(ip, serverId, player);
      }
    })
  }

  public static getPlayerLocation(ip: string) {
    return DataStorage.playerIpCache.get(ip);
  }

  public static getFlagEmoji(countryCode: string) {
    const flagOffset = 0x1F1E6;
    const asciiOffset = 0x41;

    const firstChar = countryCode.charCodeAt(0) - asciiOffset + flagOffset;
    const secondChar = countryCode.charCodeAt(1) - asciiOffset + flagOffset;

    return String.fromCodePoint(firstChar, secondChar);
  }

}

export interface PlayerStatusData {
  subRosaId: number;
  corp: number;
  money: number;
  team: number;
}