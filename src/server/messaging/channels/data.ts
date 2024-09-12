import { PlayerJoinData, PlayerListData } from "../../types/player.js";
import Channel from "../channel.js";

export const DataChannel = new Channel<{
    "player:join": { player: PlayerJoinData },
    "player:leave": { subRosaID: number },
    "player:chat": { subRosaID: number, message: string },
    "player:list": { players: PlayerListData[] },
    "player:globalban": { subRosaID: number, reason: string },
    "server:init": { name: string, port: number, type: number, bans: { name: string, subRosaId: number }[], mode: { name: string, author: string, description: string } },
    "server:log": { message: string, admin: boolean }
}>("data", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.DataManager"
    ]
})
