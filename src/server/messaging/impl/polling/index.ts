import { Application } from "express";
import BaseServerImpl from "../base/baseServerImpl.js";
import { InternalChannel } from "../../channels/internal.js";
import ClientManager from "../../manager/clientManager.js";
import PollingClient from "./pollingClient.js"
import { json } from "express";

export default class Polling implements BaseServerImpl {
    public readonly type = "polling";
    public readonly clientId = `gateway.server.${this.type}`;

    public readonly path = "/events";
    public readonly pollingTimeout = 5000;

    public servers: Map<string, {
        resolve: (msg: any) => void,
        timeout: NodeJS.Timeout,
        client: PollingClient
    }> = new Map();

    constructor(app: Application) {
        app.use(json());
        // gateway to server communication
        app.get(this.path, (req, res) => {
            const port = req.query.port as string;

            if (!port) {
                res.status(401).send("Unauthorized");
                return;
            }

            new Promise<any>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.send(port, { error: "timeout" });
                }, this.pollingTimeout);

                let client = this.servers.get(port)?.client

                if (!client) {
                    client = new PollingClient(port);
                    ClientManager.register(client)
                }

                this.servers.set(port, {
                    resolve: (msg: any) => {
                        clearTimeout(timeout);
                        resolve(msg)
                    }, timeout, client
                })
            }).then((message) => {
                res.json(message);
            })
        })

        // server to gateway communication
        app.post(this.path, (req, res) => {
            const { port } = req.query as { port: string };
            const message = req.body;

            if (!port) {
                res.status(401).send("Unauthorized");
                return;
            }

            if (!this.servers.has(port)) {
                res.status(404).send("Not Found");
                return;
            }

            this.servers.get(port)!.client.handleMessage(message);

            res.status(200).send("OK");
        })

    }

    public send(serverId: string, message: any) {
        if (!this.servers.has(serverId)) {
            // maybe the server is not ready yet, try again in 1 second
            setTimeout(() => {
                this.send(serverId, message);
            }, 1000);
            return
        }

        const { resolve } = this.servers.get(serverId)!;
        resolve(message);
    }

    public start() {
        InternalChannel.publish(this.clientId, "server:started", { type: this.type, port: 0 });
    }

    public stop() {
        InternalChannel.publish(this.clientId, "server:stopped", { type: this.type });
    }

    public status(): "listening" | "closed" {
        return "listening";
    }
}