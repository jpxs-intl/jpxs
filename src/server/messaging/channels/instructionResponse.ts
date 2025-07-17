import Channel from "../channel.js";

export const InstructionChannel = new Channel<{
    "instruction:response": { id: string, success: boolean, data: any }
}>("instructionResponse", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.InstructionManager"
    ]
})