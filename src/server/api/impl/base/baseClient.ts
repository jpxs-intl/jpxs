import { Logger } from "../../../../utils/logger";
import NodeMatch from "../../../../utils/nodeMatch";
import { SubscribeOptions } from "../../../messaging/channel";
import PubSub from "../../../messaging/pubsub";
import { ImplType } from "../../../types/internal";
import ClientManager from "../../manager/clientManager";
export default class Client {
    public id: string;
    public type: ImplType = "unassigned"
    public logger: Logger
    public eventsToIgnore: string[] = [];
    public channels: string[] = [];

    constructor(type: ImplType) {
        this.id = `${type}-${ClientManager.newClientId()}`
        this.type = type;

        this.logger = Logger.create(`Client(${this.id})`);

        this.subscribe("subscriber")
    }

    public send(channelId: string, event: string, data: any) {
        this.logger.warn("send not implemented");
    }

    public addIgnoreEvent(event: string) {
        this.eventsToIgnore.push(event);
    }

    public shouldIgnoreEvent(event: string) {
        return NodeMatch.match(event, this.eventsToIgnore);
    }

    public disconnect() {
        this.logger.warn("disconnect not implemented");
    }

    public status(): "connected" | "disconnected" {
        return "disconnected";
    }

    public subscribe(channelId: string, options?: SubscribeOptions) {
        let channel = PubSub.getChannel(channelId);
        channel.subscribe(this.id, (channel, event, data) => {
            this.send(channel.id, event as string, data)
        }, options);
    }

    public unsubscribe(channelId: string) {
        let channel = PubSub.getChannel(channelId);
        channel.unsubscribeAll(this.id);
    }
}
