import getServerList from "sub-rosa-servers";
import { db } from "..";
import { Server } from "../database/entities/server.entity";
import { Snapshot } from "../database/entities/snapshot.entity";
import Logger from "./logger";
import ServerDatabaseManager from "./serverDatabaseManager";

export default class ServerGrabber {
  public timer: NodeJS.Timer;

  constructor() {
    this.timer = setInterval(() => this.grabServers(), 1000 * 60 * 10); // 10 minutes

    setTimeout(() => this.grabServers(), 1000 * 2); // 2 seconds (to give the database time to initialize)
  }

  public async grabServers() {
    const servers = [
      ...(await getServerList("vanilla")).map((server) => {
        return {
          ...server,
          masterServer: "vanilla",
        };
      }),
      ...(await getServerList("RosaClassic")).map((server) => {
        return {
          ...server,
          masterServer: "RosaClassic",
        };
      }),
    ];

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

        dataToPush.servers.push(serverEntity);
      }

      const lastSnapshot = await db
        .getEntityManager()
        .findOne(Snapshot, { server: serverEntity.id }, { orderBy: { timestamp: "desc" } });

      // if the last snapshot is the same as this one, and was taken less than an hour ago, skip it
      if (
        lastSnapshot &&
        ((lastSnapshot.name === server.name &&
          lastSnapshot.version === server.version &&
          lastSnapshot.build === server.build &&
          lastSnapshot.clientCompatability === server.clientCompatability &&
          lastSnapshot.passworded === server.passworded &&
          lastSnapshot.gameType === server.gameType &&
          lastSnapshot.players === server.players &&
          lastSnapshot.maxPlayers === server.maxPlayers) ||
          (lastSnapshot && lastSnapshot?.timestamp.getTime() + 1000 * 60 * 60 < new Date().getTime()))
      ) {
        continue;
      } else {
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
    }

    Logger.info(
      "ServerGrabber",
      `Pushing ${dataToPush.servers.length} servers and ${dataToPush.snapshots.length} snapshots`
    );

    await db.getEntityManager().persistAndFlush(dataToPush.servers);
    await db.getEntityManager().persistAndFlush(dataToPush.snapshots);
  }
}
