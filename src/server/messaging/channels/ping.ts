import CallbackChannel from "../callbackChannel.js";

export const PingChannel = new CallbackChannel<{
    'ping': {
        request: {
            message: string
        },
        response: {
            message: string
        }
    }
}>("ping", {
    destroyOnEmpty: false,
    isPublic: true,
    recieveOnly: [
        "jpxs.ClientManager"
    ]
})