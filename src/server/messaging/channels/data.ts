import { PlayerJoinData } from "../../types/player";
import Channel from "../channel";

export const DataChannel = new Channel<{
    "player:join": { player: PlayerJoinData },
    "player:leave": { subRosaID: number },
    "player:chat": { subRosaID: number, message: string },
    "server:log": { message: string, admin: boolean }
}>("data", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.DataManager"
    ]
})