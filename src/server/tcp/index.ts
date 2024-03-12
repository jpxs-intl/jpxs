import TCPServer from "./server";
import ServerManager from "./serverManager";

const server = new TCPServer(parseInt(process.env.TCP_PORT || "3001"));
const serverManager = new ServerManager(server);