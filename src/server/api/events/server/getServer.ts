import DataStorage from "../../../data/dataStorage";
import RequestHandler from "../../manager/requestHandler";

RequestHandler.registerHandler("servers.live", async (clientId) => {
    return DataStorage.masterServerInfo
})