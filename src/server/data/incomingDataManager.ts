import { Logger } from "../../utils/logger.js";
import { DataChannel } from "../messaging/channels/data.js";

export default class IncomingDataManager {
    public static readonly clientId = "jpxs.IncomingDataManager";
    public static logger = Logger.create("IncomingDataManager");

    public static async init() {
        DataChannel.subscribeToEvent(this.clientId, "player:join", async (data) => {
            const player = data.player

        })

        DataChannel.subscribeToEvent(this.clientId, "player:leave", async (data) => {

        })

        DataChannel.subscribeToEvent(this.clientId, "player:chat", async (data) => {

        })

        DataChannel.subscribeToEvent(this.clientId, "player:list", async (data) => {

        })
    }
}

