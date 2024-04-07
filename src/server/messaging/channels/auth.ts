import Channel from "../channel";

export enum AuthType {
    Server = "server"
}

export const AuthChannel = new Channel<{
    "auth:init": { clientId: string, token: string },
    "auth:login": { type: AuthType.Server, tag: string, port: number }
    "auth:tag": { tag: string },
    "auth:success": { clientId: string, serverId: string },
    "auth:fail": { error: string },
    "auth:delay": { delay: number, message: string }
}>("auth", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "jpxs.ClientManager",
        "jpxs.AuthManager"
    ]
})

