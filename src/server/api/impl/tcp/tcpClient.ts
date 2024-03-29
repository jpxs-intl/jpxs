import PubSub from "../../../messaging/pubsub";
import Client from "../base/baseClient";
import { Socket } from "net";

export default class TCPClient extends Client {

    constructor(public socket: Socket) {
        super("tcp");

        socket.on("data", (data) => {
            const msg = JSON.parse(data.toString());
            let channel = PubSub.getChannel(msg.channel);
            channel.publish(this.id, msg.event, msg.data);
            this.resetTimer();
        })
    }

    public send(channel: string, event: string, data: any): void {
        const msg = JSON.stringify({ channel, event, data });
        this.socket.write(msg);
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