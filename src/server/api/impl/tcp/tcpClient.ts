import PubSub from "../../../messaging/pubsub";
import Client from "../base/baseClient";
import { Socket } from "net";

export default class TCPClient extends Client {

    constructor(public socket: Socket) {
        super("tcp");

        socket.on("data", (data) => {

            // len:msg//len:msg//
            let msgs = data.toString().split("//");

            for (let message of msgs) {
                console.log(message);
                let res = message.match(/(\d+):(.+)/);

                if (!res) {
                    this.logger.error("Invalid message format");
                    continue;
                }

                let len = parseInt(res[1]);
                let msg = JSON.parse(res[2]);

                if (len !== res[2].length) {
                    this.logger.error("Invalid message length");
                    return;
                }

                let channel = PubSub.getChannel(msg.channel);
                channel.publish(this.id, msg.event, msg.data);
                this.resetTimer();
            }

        })
    }

    public send(channel: string, event: string, data: any): void {
        const msg = JSON.stringify({ channel, event, data });
        this.socket.write(`${msg.length}:${msg}//`);
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