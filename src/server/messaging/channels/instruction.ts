import Channel from "../channel.js";

export const InstructionChannel = new Channel<{
    "instruction:execute": { id: string, type: string, data: any },
    "instruction:response": { id: string, success: boolean, data: any }
}>("instruction", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.InstructionManager"
    ]
})