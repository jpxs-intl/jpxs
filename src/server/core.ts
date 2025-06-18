import TCP from "./messaging/impl/tcp/index.js";
import HTTP from "./messaging/impl/http/index.js";
import Socket from "./messaging/impl/socket/index.js";
import bot from "../discord/core/index.js";
import { Logger } from "../utils/logger.js";
import InternalWebServer from "./internal/index.js";
import ServerGrabber from "./data/serverlist/serverGrabber.js";
import { AnnouncementChannel } from "./messaging/channels/announcement.js";
import ClientManager from "./messaging/manager/networking/clientManager.js";
import AuthManager from "./messaging/manager/auth/authManager.js";
import Database, { Services } from "../database/index.js";
import TagManager from "./messaging/manager/auth/tagManager.js";
import ServerManager from "./data/serverManager.js";
import { config } from "dotenv";
import IncomingDataManager from "./data/incomingDataManager.js";
import Polling from "./messaging/impl/polling/index.js";
import DataStorage from "./data/dataStorage.js";
import PlayerManager from "./data/players/playerManager.js";
config();
export default class Core {
    public static readonly clientId = "jpxs.core";
    private static logger = Logger.create("Core");

    public static db: Database = new Database()
    public static services: Services

    public static tcp = new TCP(parseInt(process.env.TCP_PORT || "1337"));
    public static http = new HTTP(parseInt(process.env.HTTP_PORT || "3000"));
    public static socket = new Socket(this.http);
    public static polling = new Polling(this.http.app);

    public static internalWebServer = new InternalWebServer(parseInt(process.env.INTERNAL_PORT || "3001"));
    public static serverGrabber = new ServerGrabber()

    public static async start() {
        Core.logger.info("Starting servers...");

        this.services = await this.db.init()

        this.tcp.start();
        this.http.start();
        this.socket.start();
        this.polling.start();
        this.internalWebServer.start();

        ServerManager.init()
        ClientManager.init()
        AuthManager.init()
        TagManager.init()
        IncomingDataManager.init()
        PlayerManager.closeSessions()
        DataStorage.init()

        bot.init()

        Core.logger.info("Servers started.");

        setInterval(() => {
            AnnouncementChannel.publish(this.clientId, "server:status", Core.status);
        }, 10000)
    }

    public static async stop() {

        Core.logger.info("Stopping servers...");

        this.tcp.stop();
        this.http.stop();
        this.socket.stop();
        this.polling.stop()
        this.internalWebServer.stop();

        await PlayerManager.closeSessions();

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
