import { console } from "inspector";
import PubSub from "../../pubsub.js";
import Client from "../base/baseClient.js";
import { Socket } from "net";

export default class TCPClient extends Client {
    constructor(public socket: Socket) {
        super("tcp");

        socket.on("data", (data) => {

            const messages = data.toString().split("\r\n").filter((msg) => msg.length > 0);

            for (const message of messages) {
                try {
                    const parsedMessage = JSON.parse(message);
                    let channel = PubSub.getChannel(parsedMessage.channel);
                    channel.publish(this.id, parsedMessage.event, parsedMessage.data);
                    // this.resetTimer();
                } catch (e) {
                    this.logger.error(e);
                }
            }
        })
    }

    public send(channel: string, event: string, data: any): void {
        const msg = JSON.stringify({ channel, event, data });
        this.socket.write(`${msg.length}:${msg}${"\r\n"}`);
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