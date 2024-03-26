import Client from "../base/baseClient";
import { Socket } from "socket.io";
import { EventList, RequestList } from "../events/events";
import Events from "../events";
import RequestHandler from "../../manager/requestHandler";

export default class SocketClient extends Client {

    constructor(public socket: Socket<EventList, EventList>) {
        super("socket");

        // this.addIgnoreEvent("internal.**");

        socket.on("disconnect", () => {
            this.logger.info("Client disconnected");
            this.disconnect();
        })

        socket.onAny(async (event, ...args) => {

            if (event.startsWith("internal.")) {
                socket.emit("client.error", "You are not authorized to use this event.")
            }

            if (event.startsWith("request.")) {
                const eventType = event.replace("request.", "") as keyof RequestList;

                this.logger.debug(`Received request: ${eventType}`);

                // @ts-expect-error
                const res = await RequestHandler.handleRequest(eventType, this.id, ...args).catch((error) => {
                    this.logger.error("Error handling request", error);
                    Events.emit('internal.serverError', this.type, error);
                });
                if (res) {
                    // @ts-expect-error
                    socket.emit(`response.${eventType}`, res)
                }
            } else {
                Events.emit(event, ...args);
            }
        })
    }

    public send<K extends keyof EventList>(event: K, ...args: Parameters<EventList[K]>): void {
        if (this.shouldIgnoreEvent(event)) return;
        this.socket.emit(event, ...args);
    }

    public disconnect() {
        this.socket.disconnect();
        Events.emit("internal.clientDisconnected", this.type, this.id);
    }

    public status(): "connected" | "disconnected" {
        return this.socket.connected ? "connected" : "disconnected";
    }

}
