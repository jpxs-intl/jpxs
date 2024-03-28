import CallbackChannel from "../callbackChannel";

export const SubscriberChannel = new CallbackChannel<{
    "channel:subscribe": {
        request: {
            channel: string,
            key?: string
        },
        response: {
            success: boolean,
            channel: string,
            error?: string
        }
    },
    "channel:unsubscribe": {
        request: {
            channel: string,
        },
        response: {
            success: boolean,
            channel: string,
            error?: string
        }
    },
}>("subscriber", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "jpxs.ClientManager"
    ]
})
