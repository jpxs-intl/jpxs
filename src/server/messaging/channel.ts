import PubSub from "./pubsub.js";
import { Logger } from "../../utils/logger.js";

type ChannelCallback = (event: string, data: any) => void | Promise<void>;
export interface ChannelOptions {
    /**
     * Destroy the channel when there are no more subscribers
     */
    destroyOnEmpty?: boolean;
    /**
     * Clients can recieve their own events
     */
    recieveOwnEvents?: boolean;
    /**
     * Key required to subscribe to this channel
     */
    key?: string;
    /**
     * Only broadcast events to these specified clients
     */
    recieveOnly?: string[];
    /**
     * Only these clients can send messages to this channel
     */
    sendOnly?: string[];
    /**
     * Allow clients to subscribe to this channel
     */
    isPublic?: boolean;
}
export interface MessageRequiredOptions {
    sender: string;
    timestamp: number;
}

export interface SubscribeOptions {
    handlerId?: string;
    key?: string;
    once?: boolean;
}


export default class Channel<DataType extends {
    [eventName: string]: any
} = {}> {
    public clientId: string;

    public subscribers: Record<string, ChannelCallback[]> = {};
    public logger: Logger;

    constructor(public readonly id: string, public readonly options?: ChannelOptions) {
        this.clientId = `channel-${id}`
        PubSub.createChannel(this);
        this.logger = Logger.create(`channel.${id}`);
    }

    public isCorrectKey(key: string) {
        return this.options?.key ? this.options.key === key : true;
    }

    public isPublic() {
        return this.options?.isPublic == undefined || this.options.isPublic;
    }

    public subscribe<T extends keyof DataType>(clientId: string, callback: (event: T, data: DataType[T] & MessageRequiredOptions) => void | Promise<void>, options?: SubscribeOptions) {
        if (!this.isCorrectKey(options?.key || "")) {
            return;
        }

        if (!this.subscribers[clientId]) {
            this.subscribers[clientId] = [];
        }

        this.subscribers[clientId].push(async (event, data) => {
            await callback(event as T, data as DataType[T] & MessageRequiredOptions);
            if (options?.once) {
                delete this.subscribers[clientId];
            }
        })

    }

    public subscribeToEvent<T extends keyof DataType>(clientId: string, event: T, callback: (data: DataType[T] & MessageRequiredOptions) => void | Promise<void>, options?: SubscribeOptions) {
        if (!this.isCorrectKey(options?.key || "")) {
            return;
        }

        if (!this.subscribers[clientId]) {
            this.subscribers[clientId] = [];
        }

        this.subscribers[clientId].push(async (eventName, data) => {
            if (eventName === event) {
                await callback(data as DataType[T] & MessageRequiredOptions);
                if (options?.once) {
                    delete this.subscribers[clientId];
                }
            }
        })
    }

    public unsubscribeAll(clientId: string) {
        delete this.subscribers[clientId]

        if (this.options?.destroyOnEmpty && Object.keys(this.subscribers).length === 0) {
            this.destroy();
        }
    }

    public unsubscribe(clientId: string, handlerId: string) {
        if (this.subscribers[clientId]) {
            this.subscribers[clientId] = this.subscribers[clientId].filter((handler) => {
                return handler.name !== handlerId;
            })
        }

        if (this.options?.destroyOnEmpty && Object.keys(this.subscribers).length === 0) {
            this.destroy();
        }
    }


    public publish<T extends keyof DataType>(senderClientId: string, event: T, data: DataType[T]) {

        const msg = {
            sender: senderClientId,
            timestamp: Date.now(),
            ...data
        }

        if (this.options?.sendOnly && !this.options.sendOnly.includes(senderClientId)) {
            this.logger.warn(`Client ${senderClientId} tried to send message to channel ${this.id} but is not allowed to do so.`);
            return;
        }

        process.env.NETWORK_DEBUG && this.logger.debug(`${String(event)}: ${JSON.stringify(msg)}`);

        for (let clientId in this.subscribers) {
            if (this.options?.recieveOwnEvents || senderClientId !== clientId) {
                if (this.options?.recieveOnly && !this.options.recieveOnly.includes(clientId)) {
                    continue;
                }

                for (let handler of this.subscribers[clientId]) {
                    handler(event as string, msg);
                }
            }
        }
    }

    public publishToClient<T extends keyof DataType>(selfClientId: string, destinationClientId: string, event: T, data: DataType[T]) {
        const msg = {
            sender: selfClientId,
            timestamp: Date.now(),
            ...data
        }

        if (this.options?.sendOnly && !this.options.sendOnly.includes(selfClientId)) {
            this.logger.warn(`Client ${selfClientId} tried to send message to channel ${this.id} but is not allowed to do so.`);
            return;
        }



        process.env.NETWORK_DEBUG && this.logger.debug(`<${destinationClientId}>${String(event)}: ${JSON.stringify(msg)}`);

        if (this.subscribers[destinationClientId]) {
            for (let handler of this.subscribers[destinationClientId]) {
                handler(event as string, msg);
            }
        }
    }

    public destroy() {
        PubSub.removeChannel(this.id);
    }
}
