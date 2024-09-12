import { Logger } from "../../utils/logger.js";
import Core from "../core.js";
import { DataChannel } from "../messaging/channels/data.js";
import AuthManager from "../messaging/manager/auth/authManager.js";
import ClientManager from "../messaging/manager/networking/clientManager.js";

export default class IncomingDataManager {
    public static readonly clientId = "jpxs.DataManager";
    public static logger = Logger.create("IncomingDataManager");

    public static async init() {

        DataChannel.subscribeToEvent(this.clientId, "server:init", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)

            if (!client) {
                this.logger.error("Client not found")
                return
            }
        })

        DataChannel.subscribeToEvent(this.clientId, "player:join", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const player = data.player
            const client = ClientManager.getClient(data.sender)

            if (!client) {
                this.logger.error("Client not found")
                return
            }


            IncomingDataManager.logger.info(`Player ${player.subRosaID} joined ${client.name}`)

            let dbPlayer = await Core.cache.player.findOne({ gameId: player.subRosaID })

            if (!dbPlayer) {
                dbPlayer = Core.cache.player.create({
                    phoneNumber: player.phoneNumber,
                    gameId: player.subRosaID,
                    supporterLevel: 0,
                    firstSeen: new Date(),
                    lastSeen: new Date()
                })
            }

            dbPlayer.lastSeen = new Date()



            await Core.cache.em.flush()
        })

        DataChannel.subscribeToEvent(this.clientId, "player:leave", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return


        })

        DataChannel.subscribeToEvent(this.clientId, "player:chat", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return

        })

        DataChannel.subscribeToEvent(this.clientId, "player:list", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return

        })
    }
}

