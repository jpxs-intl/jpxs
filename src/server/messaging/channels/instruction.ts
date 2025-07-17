import Channel from "../channel.js";

export const InstructionChannel = new Channel<{
    "instruction:execute": { id: string, type: string, data: any },
}>("instruction", {
    destroyOnEmpty: false,
    sendOnly: [
        "jpxs.InstructionManager",
        "jpxs.ClientManager"
    ],
})
