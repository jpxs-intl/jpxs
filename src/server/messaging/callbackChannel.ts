import Channel, { ChannelOptions, MessageRequiredOptions } from "./channel";
import { InternalChannel } from "./channels/internal";

export default class CallbackChannel<DataType extends {
    [eventName: string]: {
        request: any,
        response: any
    }
} = {}> extends Channel<
    {
        [eventName in keyof DataType]: { requestId: string, data: DataType[eventName]["request"] }
    }
> {

    constructor(public readonly id: string, public readonly options?: ChannelOptions) {
        super(id, options);
    }

    public request<T extends keyof DataType>(clientId: string, event: T, data: DataType[T], options?: {
        timeout?: number
    }): Promise<DataType[T]> {
        return new Promise((resolve, reject) => {
            let requestId = Math.random().toString(36).substring(7);
            let timeout = setTimeout(() => {
                reject(new Error("Request timed out"));
                InternalChannel.publish(this.clientId, "callbackChannel:requestTimeout", { clientId, channelId: this.id, requestId });
                delete this.subscribers[requestId];
            }, options?.timeout || 5000);

            this.subscribe(clientId, (channel, event, data) => {
                resolve(data as DataType[T]["response"]);
                clearTimeout(timeout);
                this.unsubscribe(clientId, requestId);
            }, {
                once: true,
                handlerId: requestId
            })

            this.publish(clientId, event, { requestId, data });
        })
    }

    /**
     *  Register a callback for a specific event, this will be called when the event is published expecting a response
     */
    public registerCallback<T extends keyof DataType>(clientId: string, event: T, callback: (data: DataType[T]["request"] & MessageRequiredOptions) => (DataType[T]["response"] | Promise<DataType[T]["response"]>)) {
        this.subscribeToEvent(clientId, event, async (channel, data) => {
            let response = await callback(data as DataType[T]["request"] & MessageRequiredOptions);
            this.publishToClient(clientId, data.sender, event, {
                requestId: data.requestId, data: response as DataType[T]["response"] & MessageRequiredOptions
            });
        })
    }

}
