import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClentEvents } from "../../assets/web/scripts/socket/messages";
import DataStorage from "../data/dataStorage";
import ServerDatabaseManager from "../database/serverDatabaseManager";

export default class SocketHandler {

    public sockets: Socket<ClientToServerEvents, ServerToClentEvents>[] = [];

    public registerSocket(socket: Socket) {
        this.sockets.push(socket);

        socket.on("disconnect", () => {
            this.sockets = this.sockets.filter(s => s.id !== socket.id);
        })

        // register events 

        socket.on("liveservers", (callback) => {
            callback(DataStorage.servers)
        })

        socket.on("server", async (id, callback) => {
            const server = await ServerDatabaseManager.getServerForClient(id)
            callback(server)
        })
    }

  

}