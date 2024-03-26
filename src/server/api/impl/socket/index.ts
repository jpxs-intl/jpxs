import { Server } from "socket.io";
import { EventList } from "../events/events";
import HTTP from "../http";
import BaseServerImpl from "../base/baseServerImpl";
import { Logger } from "../../../../utils/logger";
import Events from "../events";
import SocketClient from "./socketClient";
import ClientManager from "../../manager/clientManager";

export default class Socket implements BaseServerImpl {
    public readonly type = "socket";
    public io: Server<EventList, EventList>;
    private logger = Logger.create("Socket");

    constructor(private server: HTTP) {
        this.io = new Server(server.server, {
            // transports: ["websocket", "polling"],
            path: "/socket"
        });
    }

    public start() {
        this.io.listen(this.server.server);

        this.logger.info("Socket server listening.");
        Events.emit("internal.serverStarted", this.type);

        this.io.on("connection", (socket) => {

            const client = new SocketClient(socket)
            ClientManager.register(client);
        });

        this.io.on("error", (error) => {
            this.logger.error(error);
            Events.emit("internal.serverError", this.type, error);
        });
    }

    public stop() {
        this.io.close();
        Events.emit("internal.serverStopped", this.type);
    }

    public status(): "listening" | "closed" {
        return this.server.status()
    }

}
