import { MasterServerData } from "sub-rosa-servers";
import { Server } from "../../database/entities/server.entity.js";
import { PlayerListData } from "../types/player.js";
import ServerManager from "./serverManager.js";
import Core from "../core.js";
import { ServerInitData } from "../types/server.js";
import { ApiChannel } from "../messaging/channels/api.js";
import ClientManager from "../messaging/manager/networking/clientManager.js";

export interface JPXSServerData {
    partial: boolean;
    jpxs: boolean;
    address: string;
    port: number;
    name: string;
    networkIdentifier?: string;

    description?: string;
    icon?: string;
    tags?: string[];
    link?: string;

    mode: {
        name: string;
        author: string;
        description: string;
    }

    playerCount: number;
    maxPlayers: number;
    version: number;
    build: string;
    clientCompatability: number;
    gameType: number;
    passworded: boolean;
    identifier: number;
    latency: number;
    masterServer: string;

    players?: JPXSPlayerData[];
}

export interface JPXSPlayerData {
    gameId: number;
    phoneNumber: number;
    steamId?: string;
    name: string;

    budget: number;
    team: number;
    crim: number;
    money: number;
    corp: number;
}
export default class DataStorage {
    public static readonly clientId = "jpxs.DataStorage"
    public static serverInfo: Record<string, JPXSServerData> = {}

    public static async init() {
        ApiChannel.registerCallback(DataStorage.clientId, "server:transferinfo", async (data) => {
            const foundServer = Object.entries(this.serverInfo).find(([id, server]) => {
                return server.networkIdentifier === data.identifier
            })

            if (!foundServer) {
                return {
                    success: false,
                    error: "Server not found"
                }
            }

            const [id, serverInfo] = foundServer
            const client = ClientManager.getClientByLocation(`${serverInfo.address}:${serverInfo.port}`)

            if (!client) {
                return {
                    success: false,
                    error: "Client not found"
                }
            }

            return {
                success: true,
                ip: serverInfo.address,
                port: serverInfo.port,
                clientId: client.id,
                name: serverInfo.name,
            }

        })
    }

    public static async onInitEvent(server: Server, data: ServerInitData) {

        if (!this.serverInfo[server.id]) {
            this.serverInfo[server.id] = {
                partial: true
            } as JPXSServerData // this will cleanly merge soon
        }

        if (data.config.serverListTags && data.config.serverListTags.includes("<default>")) {
            data.config.serverListTags = data.config.serverListTags.split(", ").filter((v) => v != "<default>").join(", ")
        }

        Object.assign(this.serverInfo[server.id], {
            jpxs: true,
            address: server.address,
            port: server.port,
            name: data.name,
            networkIdentifier: data.config?.identifier,
            description: data.config?.serverListDescription,
            icon: data.config?.serverListIcon,
            tags: data.config?.serverListTags?.split(",").map(tag => tag.trim()).slice(0, 3),
            link: data.config?.serverListUrl,
            mode: data.mode
        })

        Object.assign(server, {
            description: data.config?.serverListDescription,
            icon: data.config?.serverListIcon,
            tags: data.config?.serverListTags?.split(",").map(tag => tag.trim()),
            link: data.config?.serverListUrl,
        })

        Core.services.em.persistAndFlush(server)
    }

    public static async onPlayerListEvent(server: Server, playerList: PlayerListData[]) {
        const serverData = this.serverInfo[server.id]

        if (!serverData) {
            return
        }

        if (!this.serverInfo[server.id].players) {
            this.serverInfo[server.id].players = []
        }

        // remove players that are no longer in the list
        this.serverInfo[server.id].players = this.serverInfo[server.id].players!.filter(player => playerList.some(p => p.subRosaID === player.gameId))

        // add new players
        await Promise.all(playerList.map(async player => {
            const existingPlayer = this.serverInfo[server.id].players?.find(p => p.gameId === player.subRosaID)

            if (!existingPlayer) {
                const dbPlayer = await Core.services.player.findOne({ gameId: player.subRosaID })


                if (!dbPlayer) {
                    return
                }

                this.serverInfo[server.id].players!.push({
                    gameId: dbPlayer.gameId,
                    phoneNumber: dbPlayer.phoneNumber,
                    steamId: dbPlayer.steamId,
                    name: await dbPlayer.getName(),
                    budget: player.budget,
                    team: player.team,
                    crim: player.crim,
                    money: player.money,
                    corp: player.corp,
                })
            }
        }))
    }

    public static async onMasterServerGrab(data: (MasterServerData & {
        masterServer: string;
    })[]) {
        data.forEach((server => {
            const serverEntity = ServerManager.getServerByAddress(server.address, server.port)

            if (!serverEntity) {
                // shouldn't happen
                return
            }

            if (!this.serverInfo[serverEntity.id]) {
                this.serverInfo[serverEntity.id] = {
                    partial: true,
                    description: serverEntity.description,
                    icon: serverEntity.icon,
                    tags: serverEntity.tags,
                    link: serverEntity.link
                } as JPXSServerData // this will cleanly merge soon
            }

            Object.assign(this.serverInfo[serverEntity.id], {
                partial: false,
                jpxs: this.serverInfo[serverEntity.id].jpxs ?? false,
                address: server.address,
                port: server.port,
                name: server.name,
                playerCount: server.players,
                maxPlayers: server.maxPlayers,
                version: server.version,
                build: server.build,
                clientCompatability: server.clientCompatability,
                gameType: server.gameType,
                passworded: server.passworded,
                identifier: server.identifier,
                latency: server.latency,
                masterServer: server.masterServer,
            })


        }))

        // remove servers that are no longer in the list
        const ids = data.map(server => ServerManager.getServerByAddress(server.address, server.port)?.id)
        Object.keys(this.serverInfo).forEach(id => {
            if (!ids.includes(id)) {
                delete this.serverInfo[id]
            }
        })
    }

    public static getByAddress(address: string, port: number) {
        return Object.values(this.serverInfo).find(server => server.address === address && server.port === port)
    }
}