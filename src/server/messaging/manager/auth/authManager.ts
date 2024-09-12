import Util from "../../../../utils/index.js";
import { Logger } from "../../../../utils/logger.js";
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
    public static logger = Logger.create("AuthManager");

    public static init() {
        AuthChannel.subscribeToEvent(this.clientId, "auth:login", async (data) => {

            console.log(data)

            switch (data.type) {
                case AuthType.Server: {
                    const client = ClientManager.clients.get(data.sender) as TCPClient;
                    if (!client) {
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", { error: "Client not found" });
                        return;
                    }

                    if (!data.port) {
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", { error: "Port not provided" });
                        return;
                    }

                    const address = Util.ipv6ToIpv4(client.remoteAddress || "")
                    const server = ServerManager.getServerByAddress(address, data.port);
                    const serverData = DataStorage.masterServerInfo.find(s => s.address === address && s.port === data.port);

                    if (!server) {
                        // server is either hidden or not found, create a hidden server
                        client.name = `hidden-${address}:${data.port}`

                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:success", { clientId: data.sender, serverId: client.name, address: client.remoteAddress! });

                        let tag = TagManager.tags[data.tag];

                        if (!tag) {
                            tag = new Tag(data.tag, client.name);
                            TagManager.tags[tag.id] = tag;
                        }

                        const key = await Core.cache.key.findOne({ key: tag.key });
                        if (key) {
                            key.lastUsed = new Date();
                        }

                        await Core.cache.em.flush();

                        return;
                    }

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

                    AuthManager.logger.info(`Server ${server?.id} authenticated with tag ${tag.id}`)

                    client.name = server?.id

                    AuthChannel.publishToClient(this.clientId, data.sender, "auth:success", { clientId: data.sender, serverId: server?.id || "hidden", address: server?.address || "hidden" });

                    const key = await Core.cache.key.findOne({ key: tag.key });
                    if (key) {
                        key.lastUsed = new Date();
                    }

                    await Core.cache.em.flush();
                    break;
                }
                case AuthType.Client: {
                    // TODO: implement client auth
                    break;
                }
                case AuthType.Auxiliary: {
                    const client = ClientManager.clients.get(data.sender) as TCPClient;
                    if (!client) {
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", { error: "Client not found" });
                        return;
                    }

                    if (!data.name) {
                        AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", { error: "Client name not provided" });
                        return;
                    }

                    let tag = TagManager.tags[data.tag];

                    if (!tag) {
                        tag = new Tag(data.tag, data.name);
                        TagManager.tags[tag.id] = tag;
                    }

                    client.name = data.name;

                    AuthChannel.publishToClient(this.clientId, data.sender, "auth:success", { clientId: data.sender, serverId: data.name, address: client.remoteAddress! });
                    const key = await Core.cache.key.findOne({ key: tag.key });

                    if (key) {
                        key.lastUsed = new Date();
                    }

                    await Core.cache.em.flush();

                    break;
                }
            }
        })
    }

    public static validateClient(clientId: string) {
        const client = ClientManager.clients.get(clientId);
        if (!client || !client.name) {

            AuthChannel.publishToClient(this.clientId, clientId, "auth:invalidate", { clientId });
            return false;
        }

        return true;
    }
}
