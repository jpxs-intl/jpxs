import { PlayerJoinData, PlayerListData } from "../../types/player.js";
import { ServerInitData } from "../../types/server.js";
import Channel from "../channel.js";

export const DataChannel = new Channel<{
    "player:join": { player: PlayerJoinData },
    "player:leave": { subRosaID: number },
    "player:chat": { subRosaID: number, message: string, volume: number },
    "player:list": { time: number, sunTime: number, players: PlayerListData[] },
    "player:finance": { subRosaID: number, money: number, corporateRating: number },
    "player:globalban": { subRosaID: number, reason: string },
    "server:init": ServerInitData,
    "server:log": { message: string, admin: boolean }
}>("data", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.DataManager",
        "jpxs.ChatStreamManager"
    ]
})
