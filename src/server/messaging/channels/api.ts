import CallbackChannel from "../callbackChannel.js";

export const ApiChannel = new CallbackChannel<{
    "server:transferinfo": {
        request: {
            identifier: string,
        },
        response: {
            success: boolean,
            error?: string,
            ip?: string,
            port?: number,
            clientId?: string,
            identifier?: string,
            name?: string,
        }
    }
}>("api", {
    destroyOnEmpty: false
})