import { Logger } from "../../utils/logger";
import Core from "../core";
import { Server } from "../database/entities/server.entity";
import { DatabaseChannel } from "../messaging/channels/database";

export default class ServerManager {

    public static readonly clientId = "jpxs.ServerManager";
    public static servers: Record<string, Server> = {}
    public static logger = Logger.create("ServerManager");

    public static async init() {
        DatabaseChannel.subscribeToEvent(this.clientId, "database:initialized", async () => {
            const [servers, count] = await Core.db.em.findAndCount(Server, {})
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
        await Core.db.em.persistAndFlush(server)
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
                await Core.db.em.persistAndFlush(existingServer)
            }
        } else {
            const newServer = new Server(server)
            await this.createServer(newServer)
        }

    }

}
