import Channel from "../channel.js";

export const MasterserverChannel = new Channel<{
    "steamauth": {
        gameId: number
        phoneNumber: number
        steamId: string
        name: string
        ip: string
    }
}>("masterserver", {
    key: process.env.MS_CHANNEL_KEY,
    destroyOnEmpty: false,
    isPublic: false,
})