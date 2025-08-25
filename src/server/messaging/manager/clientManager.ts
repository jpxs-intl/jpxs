import Client from "../impl/base/baseClient.js";
import { InternalChannel } from "../channels/internal.js";
import { SubscriberChannel } from "../channels/subscriber.js";
import { AuthChannel } from "../channels/auth.js";
import { PingChannel } from "../channels/ping.js";
import Id from "../../../utils/id.js";
import AuthManager from "./auth/authManager.js";
import { Logger } from "../../../utils/logger.js";
import InstructionManager from "../../data/instructionManager.js";
import { InstructionChannel } from "../channels/instruction.js";

export default class ClientManager {
    public static readonly clientId = "jpxs.ClientManager";
    public static clients: Record<string, Client> = {}
    private static logger = Logger.create("ClientManager");

    public static init() {

        InternalChannel.subscribeToEvent(this.clientId, "client:disconnect", (client) => {
            if (!AuthManager.validateClient(client.id)) return
            delete this.clients[client.id]
        })

        SubscriberChannel.registerCallback(this.clientId, "channel:subscribe", (data) => {
            if (!AuthManager.validateClient(data.sender)) return {
                success: false,
                channel: data.channel,
            }

            let client = this.clients[data.sender]

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

            let client = this.clients[data.sender]

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
                sentAt: data.sentAt
            }

            return {
                sentAt: data.sentAt
            }
        })

        setTimeout(() => {
            InstructionManager.reloadAllServers()
        }, 15000)

    }

    public static register(client: Client) {
        this.clients[client.id] = client;
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

        InstructionChannel.publishToClient(this.clientId, client.id, "instruction:execute", {
            id: Id.get(),
            type: "reload",
            data: {}
        })
    }

    public static unregister(client: Client) {
        InternalChannel.publish(this.clientId, "client:disconnect", {
            id: client.id,
            type: client.type
        });

        delete this.clients[client.id];
    }

    public static newClientId() {
        return Id.get();
    }

    public static getClient(id: string) {
        return this.clients[id];
    }

    public static getClientByName(name: string) {
        return Object.values(this.clients).find(client => client.name === name);
    }

    public static getClientByLocation(location: string) {
        return Object.values(this.clients).find(client => client.location === location);
    }
}