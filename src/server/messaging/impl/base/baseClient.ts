import { Logger } from "../../../../utils/logger.js";
import { SubscribeOptions } from "../../channel.js";
import PubSub from "../../pubsub.js";
import { ImplType } from "../../../types/internal.js";
import ClientManager from "../../manager/clientManager.js";
export default class Client {
    public id: string;
    public name?: string
    public needsToReload: boolean = false;
    public location?: string // usually ip:port
    public type: ImplType = "unassigned"
    public logger: Logger
    public eventsToIgnore: string[] = [];
    public channels: string[] = [];
    public timeout: number = 60000;
    public timer: NodeJS.Timeout | null = null;
    public clientType: string = "unknown";

    constructor(type: ImplType) {
        this.id = `${type}-${ClientManager.newClientId()}`
        this.type = type;

        this.logger = Logger.create(`Client(${this.id})`);

        this.subscribe("subscriber")
    }

    public resetTimer() {
        // if (this.timer) {
        //     clearTimeout(this.timer);
        // }
        // this.timer = setTimeout(() => {
        //     this.logger.warn("Client timed out");
        //     this.disconnect();
        // }, this.timeout);
    }

    public send(channelId: string, event: string, data: any) {
        this.logger.warn("send not implemented");
    }

    public addIgnoreEvent(event: string) {
        this.eventsToIgnore.push(event);
    }

    public disconnect() {
        this.logger.warn("disconnect not implemented");
    }

    public status(): "connected" | "disconnected" {
        return "disconnected";
    }

    public subscribe(channelId: string, options?: SubscribeOptions) {
        let channel = PubSub.getChannel(channelId);
        channel.subscribe(this.id, (event, data) => {
            this.send(channelId, event as string, data)
        }, options);
    }

    public unsubscribe(channelId: string) {
        let channel = PubSub.getChannel(channelId);
        channel.unsubscribeAll(this.id);
    }
}
