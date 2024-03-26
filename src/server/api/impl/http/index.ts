import http from "http";
import express from "express";
import { Logger } from "../../../../utils/logger";
import Events from "../events";
import BaseServerImpl from "../base/baseServerImpl";

export default class HTTP implements BaseServerImpl {
    public readonly type = "http";
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
            Events.emit("internal.serverStarted", this.type);
        });

        this.server.on("error", (error) => {
            Events.emit("internal.serverError", this.type, error);
        })
    }

    public stop() {
        this.server.close();
        Events.emit("internal.serverStopped", this.type);
    }

    public status(): "listening" | "closed" {
        return this.server.listening ? "listening" : "closed";
    }
}
