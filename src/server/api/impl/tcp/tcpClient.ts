import Client from "../base/baseClient";
import { Socket } from "net";
import { EventList } from "../events/events";
import msgpack from "@msgpack/msgpack"
import Events from "../events";

export default class TCPClient extends Client {

    constructor(public socket: Socket) {
        super("tcp");
    }

    public send<K extends keyof EventList>(event: K, ...args: Parameters<EventList[K]>): void {
        if (this.shouldIgnoreEvent(event)) return;
        const data = msgpack.encode({ event, ...args });
        this.socket.write(data);
    }

    public disconnect() {
        this.socket.destroy();
        Events.emit("internal.clientDisconnected", this.type, this.id);
    }

    public status(): "connected" | "disconnected" {
        return this.socket.connecting ? "connected" : "disconnected";
    }

    public get remoteAddress() {
        return this.socket.remoteAddress;
    }

    public get remotePort() {
        return this.socket.remotePort;
    }

    public get localAddress() {
        return this.socket.localAddress;
    }

    public get localPort() {
        return this.socket.localPort;
    }
}