import TCP from "./messaging/impl/tcp/index.js";
import HTTP from "./messaging/impl/http/index.js";
import Socket from "./messaging/impl/socket/index.js";
import { Logger } from "../utils/logger.js";
import InternalWebServer from "./internal/index.js";
import ServerGrabber from "./data/serverlist/serverGrabber.js";
import { AnnouncementChannel } from "./messaging/channels/announcement.js";
import ClientManager from "./messaging/manager/networking/clientManager.js";
import AuthManager from "./messaging/manager/auth/authManager.js";
import Database, { Services } from "./database/index.js";
import TagManager from "./messaging/manager/auth/tagManager.js";
import ServerManager from "./data/serverManager.js";
import { config } from "dotenv";
config();
export default class Core {
    public static readonly clientId = "jpxs.core";
    private static logger = Logger.create("Core");

    public static db: Database = new Database()
    public static cache: Services

    public static tcp = new TCP(parseInt(process.env.TCP_PORT || "1337"));
    public static http = new HTTP(parseInt(process.env.HTTP_PORT || "3000"));
    public static socket = new Socket(this.http);

    public static internalWebServer = new InternalWebServer(parseInt(process.env.INTERNAL_PORT || "3001"));
    public static serverGrabber = new ServerGrabber()

    public static async start() {
        Core.logger.info("Starting servers...");

        this.cache = await this.db.init()

        this.tcp.start();
        this.http.start();
        this.socket.start();
        this.internalWebServer.start();

        ServerManager.init()
        ClientManager.init()
        AuthManager.init()
        TagManager.init()

        Core.logger.info("Servers started.");

        setInterval(() => {
            AnnouncementChannel.publish(this.clientId, "server:status", Core.status);
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
