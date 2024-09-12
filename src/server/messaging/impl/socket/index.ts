import { Server } from "socket.io";
import HTTP from "../http/index.js";
import BaseServerImpl from "../base/baseServerImpl.js";
import { Logger } from "../../../../utils/logger.js";
import SocketClient, { SocketClientEvents } from "./socketClient.js";
import ClientManager from "../../manager/networking/clientManager.js";
import { InternalChannel } from "../../channels/internal.js";

export default class Socket implements BaseServerImpl {
    public readonly type = "socket";
    public readonly clientId = `jpxs.server.${this.type}`;
    public io: Server<SocketClientEvents, SocketClientEvents>;
    private logger = Logger.create("Socket");

    constructor(private server: HTTP) {
        this.io = new Server(server.server, {
            transports: ["websocket", "polling"],
            path: "/socket",
            cors: {
                origin: "*",
            },
        });
    }

    public start() {
        this.io.listen(this.server.server);

        this.logger.info("Socket server listening.");
        InternalChannel.publish(this.clientId, "server:started", { type: this.type, port: 0 })

        this.io.on("connection", (socket) => {

            const client = new SocketClient(socket)
            ClientManager.register(client);
        });

        this.io.on("error", (error) => {
            this.logger.error(error);
            InternalChannel.publish(this.clientId, "server:error", { type: this.type, error })
        });
    }

    public stop() {
        this.io.close();
        InternalChannel.publish(this.clientId, "server:stopped", { type: this.type });
    }

    public status(): "listening" | "closed" {
        return this.server.status()
    }

}
