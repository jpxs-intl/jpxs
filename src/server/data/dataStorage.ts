import { MasterServerData } from "sub-rosa-servers";

interface JPXSServerData {
    id: string;
    address: string;
    port: number;
}
export default class DataStorage {
    public static masterServerInfo: (MasterServerData & {
        masterServer: string;
    })[] = [];

    public static jpxsServerInfo: JPXSServerData[] = [];
}