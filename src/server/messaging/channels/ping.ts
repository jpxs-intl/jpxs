import CallbackChannel from "../callbackChannel.js";

export const PingChannel = new CallbackChannel<{
    'ping': {
        request: {
            sentAt: number
        },
        response: {
            message?: string,
            sentAt: number
        }
    }
}>("ping", {
    destroyOnEmpty: false,
    isPublic: true,
    recieveOnly: [
        "jpxs.ClientManager"
    ]
})