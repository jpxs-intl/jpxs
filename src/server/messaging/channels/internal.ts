import Channel from "../channel";

export const InternalChannel = new Channel<{
    "client:connect": { type: string, id: string },
    "client:disconnect": { type: string, id: string },
    "client:status": { type: string, id: string, status: "connected" | "disconnected" },
    "server:started": { type: string, port: number },
    "server:stopped": { type: string },
    "server:status": { type: string, status: "listening" | "closed" }
    "server:error": { type: string, error: any },
    "callbackChannel:requestTimeout": { channelId: string, clientId: string, requestId: string }
}>("internal", {
    destroyOnEmpty: false,
    isPublic: false,
})
