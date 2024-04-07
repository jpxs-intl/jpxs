import { PlayerJoinData, PlayerListData } from "../../types/player.js";
import Channel from "../channel.js";

export const DataChannel = new Channel<{
    "player:join": { player: PlayerJoinData },
    "player:leave": { subRosaID: number },
    "player:chat": { subRosaID: number, message: string },
    "player:list": { players: PlayerListData[] },
    "server:log": { message: string, admin: boolean }
}>("data", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.DataManager"
    ]
})