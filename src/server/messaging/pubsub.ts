import { Logger } from "../../utils/logger";
import Channel from "./channel";

export default class PubSub {

    public static channels: Record<string, Channel<{
        [eventName: string]: any
    }>> = {};

    public static logger: Logger = Logger.create("PubSub");

    public static getChannel(id: string) {
        if (!this.channels[id]) {
            this.channels[id] = new Channel(id);
        }
        return this.channels[id];
    }

    public static removeChannel(id: string) {
        delete this.channels[id];
    }

    public static getChannels(options?: {
        isPublic?: boolean
    }) {
        return Object.values(this.channels).filter(channel => {
            if (options?.isPublic && !channel.isPublic()) {
                return false;
            }
            return true;
        });
    }

    public static createChannel(channel: Channel) {
        this.logger.info(`Creating channel ${channel.id}`);
        this.channels[channel.id] = channel;
    }

}