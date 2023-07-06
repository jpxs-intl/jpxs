import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClentEvents } from "./messages";

const socketClient: Socket<ServerToClentEvents, ClientToServerEvents> = io();

socketClient.on("connect", () => {
    console.log("Socket connected");
    }
);

socketClient.on("disconnect", () => {
    console.log("Socket disconnected");
    }
);

export default socketClient;
