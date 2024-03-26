import { Logger } from "../../../../utils/logger";
import NodeMatch from "../../../../utils/nodeMatch";
import { ImplType } from "../../../types/internal";
import ClientManager from "../../manager/clientManager";
import { EventList } from "../events/events";
export default class Client {
    public id: string;
    public type: ImplType = "unassigned"
    public logger: Logger
    public eventsToIgnore: string[] = [];

    constructor(type: ImplType) {
        this.id = `${type}-${ClientManager.newClientId()}`
        this.type = type;

        this.logger = Logger.create(`Client(${this.id})`);
    }

    public send<K extends keyof EventList>(event: K, ...args: Parameters<EventList[K]>) {
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
}
