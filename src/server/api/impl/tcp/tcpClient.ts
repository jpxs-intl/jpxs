import Client from "../base/baseClient";
import { Socket } from "net";
import msgpack from "@msgpack/msgpack"

export default class TCPClient extends Client {

    constructor(public socket: Socket) {
        super("tcp");
    }

    public send(channel: string, event: string, data: any): void {
        if (this.shouldIgnoreEvent(event)) return;
        const msg = msgpack.encode({ channel, event, data });
        this.socket.write(data);
    }

    public disconnect() {
        this.socket.destroy();
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