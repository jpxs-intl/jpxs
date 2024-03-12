import TCPSocket from "./socket";
import TCPServer from "./server";
import { Socket } from "net";
import Logger from "../../utils/logger";
import fs from "fs";
import path from "path";

export default class ServerManager {

    public handlers: Map<string, (socket: Socket, data: any) => void> = new Map();
    public modules: Map<string, string> = new Map();
    public tempSockets: Map<string, TCPSocket> = new Map();
    public sockets: Map<string, TCPSocket> = new Map();

    constructor(private server: TCPServer) {
        this.server.server.on('connection', this.onConnection.bind(this));
        this.server.start()

        this.handlers.set('requestModule', this.onRequestModule.bind(this));
        this.handlers.set('register', this.onRegister.bind(this));

        this.loadModules();
    }

    private onConnection(socket: Socket) {
        socket.on('end', this.onEnd.bind(this));
        socket.on('error', this.onError.bind(this));

        const tcpSocket = new TCPSocket(socket);
        this.tempSockets.set(`${socket.remoteAddress}:${socket.remotePort}`, tcpSocket);

        Logger.log('TCP', `New connection from ${socket.remoteAddress}:${socket.remotePort}`);

        tcpSocket.socket.on('data', (data: Buffer) => {
            const json = JSON.parse(data.toString());
            const handler = this.handlers.get(json.type);

            if (handler) {
                handler(socket, json);
            }

            console.log(json);
        })
    }

    private onEnd() {
        console.log('end');
    }

    private onError(err: Error) {
        console.error(err);
    }

    private sendData(socket: Socket, data: {
        type: string,
        data: any
    }) {
        console.log(data);
        socket.write(JSON.stringify(data));
        socket.write
    }

    public loadModules() {
        const modules = fs.readdirSync(path.resolve('./src/assets/lua/modules'));

        for (const mod of modules) {
            const modulePath = path.resolve('./src/assets/lua/modules', mod);
            const moduleFile = fs.readFileSync(modulePath, 'utf-8');
            this.modules.set(mod.replace(".lua", ""), moduleFile);
            Logger.log('TCP', `Loaded module: ${mod}`);
        }
    }

    private onRequestModule(socket: Socket, data: { type: 'requestModule', name: string }) {
        const module = this.modules.get(data.name);

        if (module) {
            this.sendData(socket, {
                type: 'exec',
                data: {
                    code: module
                }
            });
        }
    }

    private onRegister(socket: Socket, data: { type: 'register', module: string }) {

    }
}
