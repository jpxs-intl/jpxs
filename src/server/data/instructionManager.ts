import { InstructionChannel } from "../messaging/channels/instruction.js";
import ClientManager from "../messaging/manager/networking/clientManager.js";

export default class InstructionManager {
    public static readonly clientId = "jpxs.InstructionManager";

    public static reloadAllServers() {
        InstructionChannel.publish(this.clientId, "instruction:execute", {
            id: Math.random().toString(36).substring(7),
            type: "reload",
            data: ""
        })
    }

    public static announce(message: string, serverId?: string) {
        if (!serverId) {
            InstructionChannel.publish(this.clientId, "instruction:execute", {
                id: Math.random().toString(36).substring(7),
                type: "announce",
                data: { message }
            });
        } else {
            const server = ClientManager.getClientByName(serverId);
            if (!server) {
                throw new Error(`Server with ID ${serverId} not found`);
            }
            InstructionChannel.publish(server.id, "instruction:execute", {
                id: Math.random().toString(36).substring(7),
                type: "announce",
                data: { message }
            });
        }
    }
}
