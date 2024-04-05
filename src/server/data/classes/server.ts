import Util from "../../../utils";

export default class Server {

    public serverId?: string;
    public sessionToken: string;
    public key?: string;

    constructor(public clientId: string) {
        this.sessionToken = this.generateSessionToken();
    }

    private generateSessionToken(): string {
        return Util.randomString(32);
    }

    public get ready(): boolean {
        return this.serverId !== undefined;
    }


}
