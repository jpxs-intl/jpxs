import cuid from "cuid";
import { db } from "../..";
import { Server } from "../../database/entities/server.entity";
import UpdateableCache from "./cache/updateableCache";
import Logger from "../logger";

export default class ServerDatabaseManager {
  private _serverCache: UpdateableCache<Server, string>; // key: id, value: Server
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

  constructor() {
    this._serverCache = new UpdateableCache<Server, string>(async (key: string) => {
      const server = await db.getEntityManager().findOne(Server, {
        id: key,
      });

      if (server) {
        return server;
      }
      return undefined;
    });
  }

  public async getServer(id: string): Promise<Server | undefined> {
    return await this._serverCache.getOrFetch(id);
  }

  public async getServerByIpAndPort(ip: string, port: number): Promise<Server | undefined> {
    const server = await db.getEntityManager().findOne(Server, {
      address: ip,
      port: port,
    });

    if (server) {
      this._serverCache.set(server.id, server);
      return server;
    }
    return undefined;
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

    this._serverCache.set(data.id, data);
    await db.getEntityManager().persistAndFlush(data);
  }

  public static async getServer(address: string, port: number, identifier: number) {
    return await db.getEntityManager().findOne(Server, { address, port, identifier });
  }
}
