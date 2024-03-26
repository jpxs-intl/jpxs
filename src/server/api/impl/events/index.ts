import EventEmitter from "events";
import { EventList } from "./events";
import { Logger } from "../../../../utils/logger";
import ClientManager from "../../manager/clientManager";


export default class Events {
    private static emitter = new EventEmitter();
    private static logger = Logger.create("Events");

    public static emit<K extends keyof EventList>(event: K, ...args: Parameters<EventList[K]>) {
        Events.logger.debug(`${event}: ${args}`);
        ClientManager.broadcast(event, ...args);
        return Events.emitter.emit(event, ...args);
    }

    public static on<K extends keyof EventList>(event: K, listener: EventList[K]) {
        Events.logger.debug(`Adding listener for ${event}`);
        return Events.emitter.on(event, listener);
    }

    public static onAny(listener: (event: string | symbol, ...args: any[]) => void) {
        Events.logger.debug(`Adding listener for any event`);
        return Events.emitter.on("any", listener);
    }

    public static once<K extends keyof EventList>(event: K, listener: EventList[K]) {
        Events.logger.debug(`Adding one-time listener for ${event}`);
        return Events.emitter.once(event, listener);
    }

    public static off<K extends keyof EventList>(event: K, listener: EventList[K]) {
        Events.logger.debug(`Removing listener for ${event}`);
        return Events.emitter.off(event, listener);
    }

    public static removeAllListeners<K extends keyof EventList>(event?: K) {
        return Events.emitter.removeAllListeners(event);
    }

    public static listenerCount<K extends keyof EventList>(event: K) {
        return Events.emitter.listenerCount(event);
    }

    public static listeners<K extends keyof EventList>(event: K) {
        return Events.emitter.listeners(event);
    }

    public static get eventNames() {
        return Events.emitter.eventNames();
    }

    public static rawListeners<K extends keyof EventList>(event: K) {
        return Events.emitter.rawListeners(event);
    }

    public static addListener<K extends keyof EventList>(event: K, listener: EventList[K]) {
        return Events.emitter.addListener(event, listener);
    }

    public static prependListener<K extends keyof EventList>(event: K, listener: EventList[K]) {
        return Events.emitter.prependListener(event, listener);
    }

    public static prependOnceListener<K extends keyof EventList>(event: K, listener: EventList[K]) {
        return Events.emitter.prependOnceListener(event, listener);
    }

    public static removeListener<K extends keyof EventList>(event: K, listener: EventList[K]) {
        return Events.emitter.removeListener(event, listener);
    }

    public static set maxListeners(n: number) {
        Events.emitter.setMaxListeners(n);
    }

    public static get maxListeners() {
        return Events.emitter.getMaxListeners();
    }
}
