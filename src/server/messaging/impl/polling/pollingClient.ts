import Core from "../../../core.js";
import PubSub from "../../../messaging/pubsub.js";
import Client from "../base/baseClient.js";

export default class PollingClient extends Client {
    constructor(public serverId: string) {
        super("polling");
    }

    public handleMessage(message: any): void {
        const channel = PubSub.getChannel(message.channelId);
        channel.publish(this.id, message.event, message.data);
        this.resetTimer();
    }

    public send(channelId: string, event: string, data: any): void {
        Core.polling.send(this.serverId, {
            channelId,
            event,
            data
        });
    }
}
