import Client from "../../impl/base/baseClient.js";
import { InternalChannel } from "../../channels/internal.js";
import { SubscriberChannel } from "../../channels/subscriber.js";
import { AuthChannel } from "../../channels/auth.js";
import { PingChannel } from "../../channels/ping.js";
import Id from "../../../../utils/id.js";
import AuthManager from "../auth/authManager.js";
import { Logger } from "../../../../utils/logger.js";

export default class ClientManager {
    public static readonly clientId = "jpxs.ClientManager";
    public static clients = new Map<string, Client>();
    private static logger = Logger.create("ClientManager");

    public static init() {

        InternalChannel.subscribeToEvent(this.clientId, "client:disconnect", (client) => {
            if (!AuthManager.validateClient(client.id)) return
            this.clients.delete(client.id);
        })

        SubscriberChannel.registerCallback(this.clientId, "channel:subscribe", (data) => {
            if (!AuthManager.validateClient(data.sender)) return {
                success: false,
                channel: data.channel,
            }

            let client = this.clients.get(data.sender);

            if (client) {
                client.subscribe(data.channel);
            } else return {
                success: false,
                channel: data.channel,
                message: "Client not found"
            }

            return {
                success: true,
                channel: data.channel,
            }
        })

        SubscriberChannel.registerCallback(this.clientId, "channel:unsubscribe", (data) => {
            if (!AuthManager.validateClient(data.sender)) return {
                success: false,
                channel: data.channel,
            }

            let client = this.clients.get(data.sender);

            if (client) {
                client.unsubscribe(data.channel);
            } else return {
                success: false,
                channel: data.channel,
                message: "Client not found"
            }

            return {
                success: true,
                channel: data.channel,
            }
        })

        PingChannel.registerCallback(this.clientId, "ping", (data) => {

            if (!AuthManager.validateClient(data.sender)) return {
                message: "auth invalid, please re-authenticate",
            }

            return {
                message: "pong",
            }
        })

    }

    public static register(client: Client) {
        this.clients.set(client.id, client);
        InternalChannel.publish(this.clientId, "client:connect", {
            id: client.id,
            type: client.type
        });

        client.subscribe("subscriber")
        client.subscribe("auth")
        client.subscribe("ping")

        AuthChannel.publishToClient(this.clientId, client.id, "auth:init", {
            clientId: client.id,
        })
    }

    public static unregister(client: Client) {
        InternalChannel.publish(this.clientId, "client:disconnect", {
            id: client.id,
            type: client.type
        });
    }

    public static newClientId() {
        return Id.get();
    }

    public static getClient(id: string) {
        return this.clients.get(id);
    }

}