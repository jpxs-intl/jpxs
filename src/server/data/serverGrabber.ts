import getServerList, { ServerData } from "sub-rosa-servers";
import { db } from "../../index";
import { Server } from "../../database/entities/server.entity";
import { Snapshot } from "../../database/entities/snapshot.entity";
import Logger from "../../utils/logger";
import ServerDatabaseManager from "../database/serverDatabaseManager";
import PanelUtil from "./panelUtil";
import DataStorage from "./dataStorage";
import CacheStorage from "../database/cacheStorage";
import PatchManager from "./patch/patchManager";

export default class ServerGrabber {
  public timer: NodeJS.Timer;

  public contributeEnabled: boolean = true;
  public cache: (ServerData & {
    masterServer: "vanilla" | "jpxs";
  })[] = [];
  public lastSaved: number = 0;

  constructor(options?: { contribute: boolean }) {
    this.timer = setInterval(() => this.grabServers(), 15000); // 15 seconds

    if (options?.contribute === false) {
      this.contributeEnabled = false;
    }

    setTimeout(() => this.grabServers(), 1000 * 2); // 2 seconds (to give the database time to initialize)

    PatchManager.loadPatches();
  }

  public async getServerData(): Promise<
    (ServerData & {
      masterServer: "vanilla" | "jpxs";
    })[]
  > {
    const masterServers = {
      vanilla: "66.226.72.227",
      RosaClassic: "5.161.203.188",
    };

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
          masterServer: "jpxs" as const,
        };
      }),
    ];

    this.cache = res;

    DataStorage.updateServers(res);
    PatchManager.pushPatches();

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

    Logger.info("ServerGrabber", `Last saved: ${this.lastSaved}, now: ${Date.now()} (${Date.now() - this.lastSaved}ms, ${Date.now() - this.lastSaved > 1000 * 60 * 5})`);

    if (Date.now() - this.lastSaved > 1000 * 60 * 5) {
      PanelUtil.updateServers(servers);
    }

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

      this.lastSaved = Date.now();
    }

    Logger.info(
      "ServerGrabber",
      `Pushing ${dataToPush.servers.length} servers and ${dataToPush.snapshots.length} snapshots`
    );

    if (this.contributeEnabled) await db.getEntityManager().persistAndFlush(dataToPush.servers);
    if (this.contributeEnabled) await db.getEntityManager().persistAndFlush(dataToPush.snapshots);

    Logger.info("ServerGrabber", "Done");
  }


}
