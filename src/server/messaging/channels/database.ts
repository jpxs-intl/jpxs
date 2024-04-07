import Channel from "../channel.js";

export const DatabaseChannel = new Channel<{
    "database:initialized": {},
    "database:error": { error: string }
}>("database", {
    destroyOnEmpty: false
})