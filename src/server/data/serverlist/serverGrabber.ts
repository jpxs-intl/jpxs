import getServerList from "sub-rosa-servers";
import DataStorage from "../dataStorage";
import Events from "../../api/impl/events";

export default class ServerGrabber {

    public static masterServers = {
        vanilla: "66.226.72.227",
        RosaClassic: "5.161.203.188",
    };

    constructor() {
        this.grabServers();
    }

    public async grabServers() {

        const res = [
            ...(await getServerList(ServerGrabber.masterServers.vanilla)).map((server) => {
                return {
                    ...server,
                    masterServer: "vanilla" as const,
                };
            }),
            ...(await getServerList(ServerGrabber.masterServers.RosaClassic)).map((server) => {
                return {
                    ...server,
                    masterServer: "RosaClassic" as const,
                };
            }),
        ];

        DataStorage.masterServerInfo = res;

        setTimeout(() => {
            this.grabServers();
        }, 15000);

        Events.emit("announcement.serverListUpdate", res)

        return res;
    }
}