import getServerList from "sub-rosa-servers";
import DataStorage from "../dataStorage.js";
import { Logger } from "../../../utils/logger.js";
import ServerManager from "../serverManager.js";

export interface ServerInfo {
    address: string;
    port: number;
    latency: number;
    name: string;
    version: string;
    clientCompatability: number;
    passworded: boolean;
    identifier: number;
    gameType: number;
    players: number;
    maxPlayers: number;
    masterServer: "vanilla" | "jpxs";
}

export default class ServerGrabber {
    public readonly clientId = "jpxs.ServerGrabber";
    private readonly logger = Logger.create("ServerGrabber");

    public static masterServers = {
        vanilla: "66.226.72.227",
        jpxs: "5.161.203.188",
    };

    constructor() {
        this.grabServers();
    }

    public async grabServers(): Promise<ServerInfo[]> {

        const res = [
            ...(await getServerList(ServerGrabber.masterServers.vanilla)).map((server) => {
                return {
                    ...server,
                    masterServer: "vanilla" as const,
                };
            }),
            ...(await getServerList(ServerGrabber.masterServers.jpxs)).map((server) => {
                return {
                    ...server,
                    masterServer: "jpxs" as const,
                };
            }),
        ];

        DataStorage.masterServerInfo = res;

        this.logger.debug(`Grabbed ${res.length} servers`);

        setTimeout(() => {
            this.grabServers();
        }, 15000);

        const servers: ServerInfo[] = res.map((server) => {
            ServerManager.updateServer(server)
            return {
                address: server.address,
                latency: server.latency,
                clientCompatability: server.clientCompatability,
                passworded: server.passworded,
                identifier: server.identifier,
                gameType: server.gameType,
                port: server.port,
                name: server.name,
                players: server.players,
                maxPlayers: server.maxPlayers,
                version: `${server.version}${server.build}`,
                masterServer: server.masterServer,
            }
        })


        // AnnouncementChannel.publish(this.clientId, "serverList:update", {
        //     servers
        // });

        return servers
    }
}
