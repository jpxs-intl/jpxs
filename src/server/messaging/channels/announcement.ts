import Channel from "../channel";
import { ServerInfo } from "../../data/serverlist/serverGrabber";

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