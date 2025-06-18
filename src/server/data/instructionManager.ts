import { InstructionChannel } from "../messaging/channels/instruction.js";
import ClientManager from "../messaging/manager/networking/clientManager.js";

export default class InstructionManager {
    public static readonly clientId = "jpxs.InstructionManager";

    public static async reloadAllServers() {
        InstructionChannel.publish(this.clientId, "instruction:execute", {
            id: Math.random().toString(36).substring(7),
            type: "reload",
            data: ""
        })
    }
}
