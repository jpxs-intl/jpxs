import { Logger } from "../../../utils/logger";
import Events from "../impl/events";
import { InternalRequestEventList, RequestEventList, RequestEventListNoIdentifier, RequestList, ResponseEventListNoIdentifier } from "../impl/events/events";

export default class RequestHandler {

    public static requests = new Map<string, any>();
    private static logger = Logger.create("RequestHandler");

    public static handleRequest<K extends keyof RequestList>(event: K, clientId: string, ...args: Parameters<RequestEventListNoIdentifier[`request.${K}`]>) {
        return new Promise<ReturnType<RequestList[K]>>((resolve, reject) => {
            const requestId = `${clientId}-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;

            this.logger.debug(`Handling request: ${event} - ${requestId}`);

            const timeout = setTimeout(() => {
                this.requests.delete(requestId);
                reject(`Request timed out. Either there is no handler registered for internal._request.${event} or the handler took too long to respond. \nRequest ID: ${requestId} - Client ID: ${clientId} - Event: ${event} - Args: ${args}`);
            }, 20000);

            const resolveWrapper = (result: ReturnType<RequestList[K]>) => {
                clearTimeout(timeout);
                resolve(result);
            }
            this.requests.set(requestId, resolveWrapper);

            // @ts-ignore
            Events.emit(`internal._request.${event}`, requestId, clientId, ...args);
        });
    }

    public static handleResponse(requestId: string, ...args: any[]) {
        const resolve = this.requests.get(requestId);
        if (!resolve) return;
        resolve(args);
        this.requests.delete(requestId);
    }


    // the typing in this method is a fucking trainwreck, i'm done trying to fix it
    public static registerHandler<K extends keyof RequestList>(event: K, handler: (clientId: string, ...args: Parameters<RequestEventListNoIdentifier[`request.${K}`]>) => Promise<ReturnType<RequestList[K]>>) {
        // @ts-expect-error
        Events.on(`internal._request.${event}`, async (requestId: string, clientId: string, ...args: Parameters<RequestEventListNoIdentifier[`request.${K}`]>) => {
            try {
                const result = await handler(clientId, ...args);
                // @ts-expect-error
                Events.emit(`internal._response.${event}`, requestId, clientId, result);
            } catch (error) {
            }
        });

        this.logger.debug(`Handler registered for internal._request.${event}`)
    }

}

