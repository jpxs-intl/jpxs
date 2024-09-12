import Channel from "../channel.js";

export enum AuthType {
    Server = "server",
    Client = "client",
    Auxiliary = "auxiliary"
}

export const AuthChannel = new Channel<{
    "auth:init": { clientId: string },
    "auth:login": { type: AuthType, tag: string, port?: number, name?: string }
    "auth:tag": { tag: string },
    "auth:success": { clientId: string, serverId: string, address: string },
    "auth:fail": { error: string },
    "auth:invalidate": { clientId: string },
    "auth:delay": { delay: number, message: string }
}>("auth", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "jpxs.ClientManager",
        "jpxs.AuthManager"
    ]
})

