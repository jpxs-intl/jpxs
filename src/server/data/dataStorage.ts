import { MasterServerData } from "sub-rosa-servers";

export default class DataStorage {
    public static masterServerInfo: (MasterServerData & {
        masterServer: string;
    })[]
}