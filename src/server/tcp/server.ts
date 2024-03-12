import net from "net";
import Logger from "../../utils/logger";

export default class TCPServer {
    public server: net.Server;
    private port: number;

    constructor(port: number) {
        this.port = port;
        this.server = net.createServer();
    }

    public start() {
        this.server.listen(this.port, () => {
            Logger.log('TCP', `Server started on port ${this.port}`);
        });

        this.server.on('close', () => {
            Logger.log('TCP', 'Server closed');
        });

        this.server.on('error', (err) => {
            Logger.error('TCP', 'Server error', err);
        });
    }

    public stop() {
        this.server.close();
    }
}
