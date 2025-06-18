import { Logger } from "../../utils/logger.js";
import Core from "../core.js";
import { Server } from "../../database/entities/server.entity.js";
import { DatabaseChannel } from "../messaging/channels/database.js";
import { ServerInfo } from "./serverlist/serverGrabber.js";
import { Snapshot } from "../../database/entities/snapshot.entity.js";
import { time } from "../../utils/time.js";

export default class ServerManager {

    public static readonly clientId = "jpxs.ServerManager";
    public static servers: Record<string, Server> = {}
    public static logger = Logger.create("ServerManager");

    public static async init() {
        DatabaseChannel.subscribeToEvent(this.clientId, "database:initialized", async () => {
            const [servers, count] = await Core.services.server.findAndCount({})
            servers.forEach(server => {
                this.servers[server.id] = server
            })

            this.logger.info(`Loaded ${count} servers`)
        })
    }

    public static getServer(id: string) {
        return this.servers[id]
    }

    public static getServerByAddress(address: string, port: number) {
        return Object.values(this.servers).find(server => server.address === address && server.port === port)
    }

    public static async createServer(server: Server) {
        this.servers[server.id] = server
        const newServer = Core.services.server.create(server)
        await Core.services.em.persistAndFlush(newServer)
    }

    public static async updateServer(server: {
        address: string;
        port: number;
        identifier: number;
    }) {
        const existingServer = this.getServerByAddress(server.address, server.port)

        if (existingServer) {
            if (existingServer.identifier !== server.identifier) {
                existingServer.identifier = server.identifier
                await Core.services.em.persistAndFlush(existingServer)

            }
        } else {
            const newServer = new Server(server)
            await this.createServer(newServer)
        }

    }

    public static async createSnapshots(servers: ServerInfo[]) {
        const snapshots = await Core.services.snapshot.find({
            timestamp: {
                $gte: new Date(time("24h").ago().ms()) // last 24 hours
            },
            server: {
                id: {
                    $in: servers.map(s => ServerManager.getServerByAddress(s.address, s.port)?.id).filter(id => id !== undefined) as string[],
                }
            },
        }, {
            populate: ["server"],
            orderBy: { timestamp: "DESC" },
        })

        // get the latest snapshot for each server
        const latestSnapshots: Record<string, any> = {}
        for (const snapshot of snapshots) {
            if (!latestSnapshots[snapshot.server.id] || latestSnapshots[snapshot.server.id].timestamp < snapshot.timestamp) {
                latestSnapshots[snapshot.server.id] = snapshot
            }
        }

        const updatedSnapshots = servers
            .map(server => [server, latestSnapshots[ServerManager.getServerByAddress(server.address, server.port)?.id || ""]] as [ServerInfo, Snapshot | undefined])
            .filter(([server, latestSnapshot]) =>
                latestSnapshot === undefined || latestSnapshot.timestamp < new Date(time("24h").ago().ms()) || [
                    latestSnapshot.name !== server.name,
                    latestSnapshot.playerCount !== server.players,
                    latestSnapshot.maxPlayers !== server.maxPlayers,
                ].some(Boolean)
            )
            .map(([server]) => {
                const newSnapshot = new Snapshot()
                newSnapshot.server = ServerManager.getServerByAddress(server.address, server.port) as Server
                newSnapshot.name = server.name
                newSnapshot.playerCount = server.players
                newSnapshot.maxPlayers = server.maxPlayers
                return newSnapshot
            })

        if (updatedSnapshots.length > 0) {
            await Core.services.em.persistAndFlush(updatedSnapshots);
            this.logger.info(`Created ${updatedSnapshots.length} new snapshots`);
        }
    }

}
