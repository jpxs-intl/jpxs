import NodeMatch from "../../../utils/nodeMatch";
import Client from "../impl/base/baseClient";
import Events from "../impl/events";
import { EventList } from "../impl/events/events";

import "../events/server/getServer"

export default class ClientManager {
    public static clients = new Map<string, Client>();

    public static init() {
        Events.on("internal.clientDisconnected", (type, id) => {
            this.clients.delete(id);
        });
    }

    public static register(client: Client) {
        this.clients.set(client.id, client);
        Events.emit("internal.clientConnected", client.type, client.id);
    }

    public static unregister(client: Client) {
        this.clients.delete(client.id);
        Events.emit("internal.clientDisconnected", client.type, client.id);
    }

    public static newClientId() {
        return `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}-${this.clients.size}`;
    }

    public static broadcast<K extends keyof EventList>(event: K, ...args: Parameters<EventList[K]>) {

        // const globalIgnore = ["internal.**", "request.**", "response.**"];
        // if (NodeMatch.match(event, globalIgnore)) return;

        this.clients.forEach((client) => {
            client.send(event, ...args);
        });
    }


}