import TCP from "./api/impl/tcp";
import HTTP from "./api/impl/http";
import Socket from "./api/impl/socket";
import ClientManager from "./api/manager/clientManager";
import { Logger } from "../utils/logger";
import InternalWebServer from "./internal";
import Events from "./api/impl/events";
import ServerGrabber from "./data/serverlist/serverGrabber";

export default class Core {
    private static logger = Logger.create("Core");

    public static tcp = new TCP(parseInt(process.env.TCP_PORT || "1337"));
    public static http = new HTTP(parseInt(process.env.HTTP_PORT || "3000"));
    public static socket = new Socket(this.http);

    public static internalWebServer = new InternalWebServer(parseInt(process.env.INTERNAL_PORT || "3001"));

    public static serverGrabber = new ServerGrabber()

    public static start() {

        Core.logger.info("Starting servers...");

        this.tcp.start();
        this.http.start();
        this.socket.start();
        this.internalWebServer.start();

        Core.logger.info("Servers started.");

        setInterval(() => {
            Events.emit("announcement.serverStatus", Core.status);
        }, 10000)
    }

    public static stop() {

        Core.logger.info("Stopping servers...");

        this.tcp.stop();
        this.http.stop();
        this.socket.stop();
        this.internalWebServer.stop();

        Core.logger.info("Servers stopped.");
    }

    public static restart() {
        this.stop();
        this.start();
    }

    public static get status() {
        return {
            tcp: this.tcp.status(),
            http: this.http.status(),
            socket: this.socket.status()
        }
    }
}
