import http from "http";
import express from "express";
import { Logger } from "../../../../utils/logger.js";
import BaseServerImpl from "../base/baseServerImpl.js";
import { InternalChannel } from "../../channels/internal.js";

export default class HTTP implements BaseServerImpl {
    public readonly type = "http";
    public readonly clientId = `jpxs.server.${this.type}`;
    public app = express();
    public server = http.createServer(this.app);
    private port: number = 3000;
    private logger = Logger.create("HTTP");

    constructor(port: number = 3000) {
        this.port = port;
    }

    public start() {
        this.server.listen(this.port, () => {
            this.logger.log(`HTTP server listening on port ${this.port}.`);
            InternalChannel.publish(this.clientId, "server:started", { type: this.type, port: this.port });
        });

        this.server.on("error", (error) => {
            this.logger.error(error);
            InternalChannel.publish(this.clientId, "server:error", { type: this.type, error });
        })
    }

    public stop() {
        this.server.close();
        InternalChannel.publish(this.clientId, "server:stopped", { type: this.type });
    }

    public status(): "listening" | "closed" {
        return this.server.listening ? "listening" : "closed";
    }
}
