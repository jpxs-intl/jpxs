import { InternalChannel } from "../../../messaging/channels/internal";
import PubSub from "../../../messaging/pubsub";
import Client from "../base/baseClient";
import { Socket } from "socket.io";

export interface SocketClientEvents {
    [key: string]: any
}

export default class SocketClient extends Client {

    constructor(public socket: Socket<SocketClientEvents, SocketClientEvents>) {
        super("socket");

        socket.on("disconnect", () => {
            this.logger.info("Client disconnected");
            this.disconnect();
        })

        socket.onAny(async (channelId, data: {
            event: string,
            data: any
        }) => {
            let channel = PubSub.getChannel(channelId);
            channel.publish(this.id, data.event, data.data);
            this.resetTimer();
        })
    }

    public send(channelId: string, event: string, data: any): void {
        this.socket.emit(channelId, { event, data })
    }

    public disconnect() {
        this.socket.disconnect();
        InternalChannel.publish(this.id, "client:disconnect", this);
    }

    public status(): "connected" | "disconnected" {
        return this.socket.connected ? "connected" : "disconnected";
    }

}
