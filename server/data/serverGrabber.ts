import getServerList, { ServerData } from "sub-rosa-servers";
import { db } from "../..";
import { Server } from "../../database/entities/server.entity";
import { Snapshot } from "../../database/entities/snapshot.entity";
import Logger from "../../utils/logger";
import ServerDatabaseManager from "../database/serverDatabaseManager";
import PanelUtil from "./panelUtil";
import DataStorage from "./dataStorage";
import CacheStorage from "../database/cacheStorage";

export default class ServerGrabber {
  public timer: NodeJS.Timer;

  public contributeEnabled: boolean = true;
  public cache: (ServerData & {
    masterServer: "vanilla" | "RosaClassic";
  })[] = [];
  public lastUpdated: number = 0;

  constructor(options?: { contribute: boolean }) {
    this.timer = setInterval(() => this.grabServers(), 30000); // 30 seconds 

    if (options?.contribute === false) {
      this.contributeEnabled = false;
    }

    setTimeout(() => this.grabServers(), 1000 * 2); // 2 seconds (to give the database time to initialize)
  }

  public async getServerData(): Promise<
    (ServerData & {
      masterServer: "vanilla" | "RosaClassic";
    })[]
  > {
    const masterServers = {
      vanilla: "66.226.72.227",
      RosaClassic: "5.161.203.188",
    };

    if (this.cache.length > 0 && Date.now() - this.lastUpdated < 1000 * 60 * 5) {
      return this.cache;
    }

    const res = [
      ...(await getServerList(masterServers.vanilla)).map((server) => {
        return {
          ...server,
          masterServer: "vanilla" as const,
        };
      }),
      ...(await getServerList(masterServers.RosaClassic)).map((server) => {
        return {
          ...server,
          masterServer: "RosaClassic" as const,
        };
      }),
    ];

    this.cache = res;
    this.lastUpdated = Date.now();

    DataStorage.updateServers(this.cache)

    return res;
  }

  public async getServerDataForMasterServer(
    masterServer: string
  ): Promise<(ServerData & { masterServer: string })[]> {
    return (await getServerList(masterServer)).map((server) => {
      return {
        ...server,
        masterServer,
      };
    });
  }

  public async grabServers() {
    const servers = await this.getServerData();

    PanelUtil.updateServers(servers);

    let dataToPush: {
      servers: Server[];
      snapshots: Snapshot[];
    } = {
      servers: [],
      snapshots: [],
    };

    Logger.info("ServerGrabber", `Grabbed ${servers.length} servers`);

    for (const server of servers) {
      let serverEntity = await ServerDatabaseManager.getServer(
        server.address,
        server.port,
        server.identifier
      );

      if (!serverEntity) {
        serverEntity = new Server();
        serverEntity.address = server.address;
        serverEntity.port = server.port;
        serverEntity.identifier = server.identifier;
        serverEntity.type = server.masterServer === "vanilla" ? 0 : 1;
        serverEntity.isOnline = true;

        dataToPush.servers.push(serverEntity);
        CacheStorage.servers.set(serverEntity.id, serverEntity);
      }

      // if the last snapshot is the same as this one, and was taken less than an hour ago, skip it
      const snapshot = new Snapshot();
      snapshot.server = serverEntity;
      snapshot.latency = server.latency;
      snapshot.name = server.name;
      snapshot.version = server.version;
      snapshot.build = server.build;
      snapshot.clientCompatability = server.clientCompatability;
      snapshot.passworded = server.passworded;
      snapshot.gameType = server.gameType;
      snapshot.players = server.players;
      snapshot.maxPlayers = server.maxPlayers;

      dataToPush.snapshots.push(snapshot);
      CacheStorage.snapshots.set(snapshot.id, snapshot);
    }

    Logger.info(
      "ServerGrabber",
      `Pushing ${dataToPush.servers.length} servers and ${dataToPush.snapshots.length} snapshots`
    );

    if (this.contributeEnabled) await db.getEntityManager().persistAndFlush(dataToPush.servers);
    if (this.contributeEnabled) await db.getEntityManager().persistAndFlush(dataToPush.snapshots);

    if (this.contributeEnabled) await this.updateServerOnlineStatus(servers);

    Logger.info("ServerGrabber", "Done");
  }

  public async updateServerOnlineStatus(
    serverList: {
      address: string;
      port: number;
      identifier: number;
    }[]
  ) {
    const serversToSetOnline: Server[] = [];

    for (const server of serverList) {
      const serverEntity = await ServerDatabaseManager.getServer(
        server.address,
        server.port,
        server.identifier
      );

      if (serverEntity && !serverEntity.isOnline) {
        serverEntity.isOnline = true;
        serversToSetOnline.push(serverEntity);
      }
    }

    Logger.info("ServerGrabber", `Setting ${serversToSetOnline.length} servers online`);

    await db.getEntityManager().persistAndFlush(serversToSetOnline);

    const serversToSetOffline = await db.getEntityManager().find(Server, {
      isOnline: true,
      $nin: serversToSetOnline,
    });

    Logger.info("ServerGrabber", `Setting ${serversToSetOffline.length} servers offline`);
    await db.getEntityManager().persistAndFlush(serversToSetOffline);
  }
}
