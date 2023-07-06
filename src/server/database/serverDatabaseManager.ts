import cuid from "cuid";
import { db } from "../../index";
import { Server } from "../../database/entities/server.entity";
import Logger from "../../utils/logger";
import LocalIpConverter from "../../utils/convertIp";
import { DatabaseServerData } from "../../assets/web/scripts/socket/messages";
import CacheStorage from "./cacheStorage";

export default class ServerDatabaseManager {
  private _tempServers: {
    id: string;
    ip: string;
    port: number;
    name: string;
  }[] = [];

  private static _instance: ServerDatabaseManager;

  public static get instance(): ServerDatabaseManager {
    if (!this._instance) {
      this._instance = new ServerDatabaseManager();
    }
    return this._instance;
  }

  public async getServer(id: string): Promise<Server | undefined> {
    return await CacheStorage.servers.get(id);
  }

  public async getServerByIpAndPort(ip: string, port: number): Promise<Server | undefined> {
    Logger.log("ServerDatabaseManager", `Getting server by ip and port ${ip}:${port}`);

    const id = await CacheStorage.addressMap.get({
      address: LocalIpConverter.convertIp(ip),
      port,
    });

    const server = id
      ? await CacheStorage.servers.get(id)
      : await db.getEntityManager().findOne(Server, {
          address: LocalIpConverter.convertIp(ip),
          port: port,
        });

    if (server) {
      Logger.log("ServerDatabaseManager", `Found server with id ${server.id}`);

      CacheStorage.servers.set(server.id, server);

      return server;
    }

    Logger.log("ServerDatabaseManager", `No server found`);

    return undefined;
  }

  public async validateServer(id: string, ip: string, port?: number): Promise<boolean> {
    const server = await this.getServer(id);
    if (server) {
      return server.address === LocalIpConverter.convertIp(ip) && port ? server.port === port : true;
    }

    return false;
  }

  public createTempServer(ip: string, port: number, name: string) {
    const tempId = cuid();
    this._tempServers.push({
      id: tempId,
      ip: ip,
      port: port,
      name: name,
    });

    Logger.log(
      "ServerDatabaseManager",
      `Created temp server with id ${tempId} and name ${name} at ${ip}:${port}`
    );

    return tempId;
  }

  public async createServer(data: Server) {
    const tempServer = this._tempServers.find((tempServer) => tempServer.id === data.id);
    if (tempServer) {
      data.id = tempServer?.id || data.id;
    }

    CacheStorage.servers.set(data.id, data);
    await db.getEntityManager().persistAndFlush(data);
  }

  public async updateServer(data: Server) {
    CacheStorage.servers.set(data.id, data);
    await db.getEntityManager().persistAndFlush(data);
  }

  public static async getServer(address: string, port: number, identifier: number) {
    return await CacheStorage.addressMap
      .get({
        address: address,
        port: port,
      })
      .then(async (server) => {
        if (server) {
          return await CacheStorage.servers.get(server);
        }
        return undefined;
      });
  }

  public static async getServerForClient(id: string): Promise<DatabaseServerData | undefined> {
    const server = await this.instance.getServer(id);

    if (!server) {
      Logger.log("ServerDatabaseManager", `No server found`);
      return undefined;
    }

    const snapshots = await CacheStorage.snapshots.getServerSnapshots(server.id);

    return {
      ...server,
      snapshots: snapshots
        .map((snapshot) => {
          // @ts-ignore
          snapshot.server = undefined;
          return snapshot;
        })
        .sort((a, b) => {
          return a.timestamp.getTime() - b.timestamp.getTime();
        }),
    };
  }
}
