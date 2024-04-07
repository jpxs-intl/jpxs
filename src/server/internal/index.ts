import http from "http";
import express from "express";
import { Logger } from "../../utils/logger.js";

export default class InternalWebServer {
    public app = express();
    public server = http.createServer(this.app);
    private port: number = 3001;
    private logger = Logger.create("Internal");

    constructor(port: number = 3001) {
        this.port = port;
    }

    public start() {
        this.server.listen(this.port, () => {
            this.logger.log(`Internal server listening on port ${this.port}.`);
        });
    }

    public stop() {
        this.server.close();
    }

    public status(): "listening" | "closed" {
        return this.server.listening ? "listening" : "closed";
    }


}