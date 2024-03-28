import net from "net";
import { Logger } from "../../../../utils/logger";
import BaseServerImpl from "../base/baseServerImpl";
import TCPClient from "./tcpClient";
import ClientManager from "../../manager/clientManager";
import { InternalChannel } from "../../../messaging/channels/internal";

export default class TCP implements BaseServerImpl {
    public readonly type = "tcp";
    public readonly clientId = `jpxs.server.${this.type}`;
    private server: net.Server;
    private port: number = 1337;
    private logger = Logger.create("TCP");

    constructor(port: number = 1337) {
        this.port = port;
        this.server = net.createServer(this.onConnection.bind(this));
    }

    public start() {
        this.server.listen(this.port, () => {
            this.logger.info(`TCP server listening on port ${this.port}.`);
            InternalChannel.publish(this.clientId, "server:started", { type: this.type, port: this.port });
        });
    }

    public stop() {
        this.server.close();
        InternalChannel.publish(this.clientId, "server:stopped", { type: this.type });
    }

    public status(): "listening" | "closed" {
        return this.server.listening ? "listening" : "closed";
    }

    private onConnection(socket: net.Socket) {

        const client = new TCPClient(socket);
        ClientManager.register(client);

        socket.on("close", () => {
            this.logger.debug(`connection from ${client.id} closed`);
            ClientManager.unregister(client);
        });
    }

}