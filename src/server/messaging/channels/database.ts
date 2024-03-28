import Channel from "../channel";

export const DatabaseChannel = new Channel<{
    "database:initialized": {},
    "database:error": { error: string }
}>("database", {
    destroyOnEmpty: false
})