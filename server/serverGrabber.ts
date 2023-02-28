import getServerList, { ServerData } from "sub-rosa-servers";
import { db } from "..";
import { LiveServer } from "../database/entities/liveServer";
import { Server } from "../database/entities/server.entity";
import { Snapshot } from "../database/entities/snapshot.entity";
import Logger from "./logger";
import ServerDatabaseManager from "./serverDatabaseManager";

export default class ServerGrabber {
  public timer: NodeJS.Timer;

  constructor() {
    this.timer = setInterval(() => this.grabServers(), 1000 * 60 * 5); // 10 minutes

    setTimeout(() => this.grabServers(), 1000 * 2); // 2 seconds (to give the database time to initialize)
  }

  public async getServerData(): Promise<
    (ServerData & {
      masterServer: "vanilla" | "RosaClassic";
    })[]
  > {
    return [
      ...(await getServerList("vanilla")).map((server) => {
        return {
          ...server,
          masterServer: "vanilla" as const,
        };
      }),
      ...(await getServerList("RosaClassic")).map((server) => {
        return {
          ...server,
          masterServer: "RosaClassic" as const,
        };
      }),
    ];
  }

  public async grabServers() {
    const servers = await this.getServerData();
    
    this.updateLiveServerList(servers);

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
    }

    Logger.info(
      "ServerGrabber",
      `Pushing ${dataToPush.servers.length} servers and ${dataToPush.snapshots.length} snapshots`
    );

    await db.getEntityManager().persistAndFlush(dataToPush.servers);
    await db.getEntityManager().persistAndFlush(dataToPush.snapshots);

    await this.updateServerOnlineStatus(servers);

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

  public async updateLiveServerList(servers: (ServerData & { masterServer: string })[]) {
    await db.getEntityManager().nativeDelete(LiveServer, {});
    const liveServers = servers.map((server) => {
      const liveServer = new LiveServer();
      liveServer.address = server.address;
      liveServer.port = server.port;
      liveServer.identifier = server.identifier;
      liveServer.type = server.masterServer === "vanilla" ? 0 : 1;
      liveServer.latency = server.latency;
      liveServer.name = server.name;
      liveServer.version = server.version;
      liveServer.build = server.build;
      liveServer.clientCompatability = server.clientCompatability;
      liveServer.passworded = server.passworded;
      liveServer.gameType = server.gameType;
      liveServer.players = server.players;
      liveServer.maxPlayers = server.maxPlayers;
      return liveServer;
    });

    await db.getEntityManager().persistAndFlush(liveServers);
  }
}
