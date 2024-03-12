import { Socket } from "net";
import Logger from "../../utils/logger";
export default class TCPSocket {

    constructor(public socket: Socket) {
        this.socket.on('data', this.onData);
    }

    private onData(data: Buffer) {
        Logger.log(data.toString());
    }


}

