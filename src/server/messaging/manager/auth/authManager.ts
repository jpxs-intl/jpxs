import Util from "../../../../utils/index.js";
import Core from "../../../core.js";
import DataStorage from "../../../data/dataStorage.js";
import ServerManager from "../../../data/serverManager.js";
import { Tag } from "../../../database/entities/tag.entity.js";
import { AuthChannel, AuthType } from "../../channels/auth.js";
import TCPClient from "../../impl/tcp/tcpClient.js";
import ClientManager from "../networking/clientManager.js";
import KeyManager from "./keyManager.js";
import TagManager from "./tagManager.js";

export default class AuthManager {

    public static readonly clientId = "jpxs.AuthManager";

    public static init() {
        AuthChannel.subscribeToEvent(this.clientId, "auth:login", async (data) => {
            switch (data.type) {
                case AuthType.Server: {
                    const client = ClientManager.clients.get(data.sender) as TCPClient;
                    if (!client) {
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", { error: "Client not found" });
                        return;
                    }

                    const address = Util.ipv6ToIpv4(client.remoteAddress || "")
                    const server = ServerManager.getServerByAddress(address, data.port);
                    const serverData = DataStorage.masterServerInfo.find(s => s.address === address && s.port === data.port);

                    let tag = TagManager.tags[data.tag];
                    if (!tag) {
                        if (!serverData || !server) {
                            AuthChannel.publishToClient(this.clientId, data.sender, "auth:delay", { delay: 15, message: "I haven't seen your server yet. Wait 15 seconds and attempt auth again." });
                            return;
                        }

                        const key = await KeyManager.createKey(`auto-${serverData.address}:${serverData.port}`, [serverData.address], `autocreated key for ${serverData.name}`, "group", 3, false)
                        tag = new Tag(key.key, server.id)
                        TagManager.tags[tag.id] = tag;

                        Core.cache.tag.create(tag);
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:tag", { tag: tag.id });
                    }

                    client.name = server?.id

                    AuthChannel.publishToClient(this.clientId, data.sender, "auth:success", { clientId: data.sender, serverId: server?.id || "hidden" });
                    await Core.cache.em.flush();
                    break;
                }
            }
        })
    }
}
