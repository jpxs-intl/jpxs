import Channel from "../channel.js";
import { ServerInfo } from "../../data/serverlist/serverGrabber.js";

export const AnnouncementChannel = new Channel<{
    "serverList:update": {
        servers: ServerInfo[]
    },
    "server:status": {
        [serverType: string]: "listening" | "closed"
    }
}>("announcement", {
    destroyOnEmpty: false
})