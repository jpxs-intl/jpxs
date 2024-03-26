import { MasterServerData } from "sub-rosa-servers";
import { ImplType as ImplType } from "../../../types/internal";
import { ISubRosaPlayerJoinData, ISubRosaPlayerUpdateData } from "../../../types/subRosa";

export interface RequestList {
    // internal stuff
    'server.status': () => {
        [service: string]: string;
    },

    // servers
    'servers.live': () => (MasterServerData & {
        masterServer: string;
    })[],

    // players
    'getPlayer': (id: string) => ISubRosaPlayerJoinData | undefined;
}


export interface ExternalEventList {
    'post.playerJoin': (player: ISubRosaPlayerJoinData) => void;
    'post.playerUpdate': (players: ISubRosaPlayerUpdateData[]) => void;
    'client.error': (error: string) => void;
}

export interface InternalEventList {
    'internal.clientConnected': (type: ImplType, id: string) => void;
    'internal.clientDisconnected': (type: ImplType, id: string) => void;
    'internal.clientError': (type: ImplType, id: string, error: Error) => void;
    'internal.serverError': (type: ImplType, error: Error) => void;
    'internal.serverStarted': (type: ImplType) => void;
    'internal.serverStopped': (type: ImplType) => void;
    'internal.serverRestarted': (type: ImplType) => void;
    'internal.databaseConnected': () => void;
    'internal.databaseDisconnected': () => void;
    'internal.databaseError': (error: Error) => void;
}

export interface AnnouncementEventList {
    'announcement.serverStatus': (status: {
        [key: string]: "listening" | "closed";
    }) => void,
    'announcement.serverListUpdate': (servers: (MasterServerData & {
        masterServer: "vanilla" | "RosaClassic";
    })[]) => void;
}


export type RequestEventListNoIdentifier = {
    [K in keyof RequestList as `request.${string & K}`]: (...args: Parameters<RequestList[K]>) => void;
}

export type ResponseEventListNoIdentifier = {
    [K in keyof RequestList as `response.${string & K}`]: (result: ReturnType<RequestList[K]>) => void;
}

export type RequestEventList = {
    [K in keyof RequestEventListNoIdentifier]: (...args: Parameters<RequestEventListNoIdentifier[K]>) => void;
}

export type ResponseEventList = {
    [K in keyof ResponseEventListNoIdentifier]: (...args: Parameters<ResponseEventListNoIdentifier[K]>) => void;
}

export type InternalRequestEventList = {
    [K in keyof RequestEventListNoIdentifier as `internal._${string & K}`]: (requestId: string, clientId: string, ...args: Parameters<RequestEventListNoIdentifier[K]>) => void;
}

export type InternalResponseEventList = {
    [K in keyof ResponseEventListNoIdentifier as `internal._${string & K}`]: (requestId: string, clientId: string, ...args: Parameters<ResponseEventListNoIdentifier[K]>) => void;
}

export type InternalExternalEventList = InternalEventList & ExternalEventList;
export type RequestResponseEventList = RequestEventList & ResponseEventList;
export type InternalRequestResponseEventList = InternalRequestEventList & InternalResponseEventList
export type EventList = InternalExternalEventList & AnnouncementEventList & RequestResponseEventList & InternalRequestResponseEventList;
