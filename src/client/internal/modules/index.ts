import io, { Socket } from "socket.io-client";
import { SocketClientEvents } from "../../../server/api/impl/socket/socketClient";

const socket: Socket<SocketClientEvents, SocketClientEvents> = io({
    path: "/socket",
})

function stringify(obj: any): string {
    if (typeof obj === "object") {
        return JSON.stringify(obj);
    }
    return obj.toString()
}

socket.onAny((event, ...args) => {
    document.body.innerHTML += `<p>${event}: ${args.map((a) => stringify(a))}</p>`;
})

setInterval(() => {
    socket.emit("request.getPlayer", "6443302")
}, 1000)