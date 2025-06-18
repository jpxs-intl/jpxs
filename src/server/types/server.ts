export interface ServerInitData {
    name: string;
    port: number;
    type: number;
    mode: {
        name: string;
        author: string;
        description: string;
    }
    bans: {
        name: string;
        subRosaId: number;
    },
    config: {
        identifier: string;
        serverListIcon: string;
        serverListDescription: string;
        serverListUrl: string;
        serverListTags: string;
    }
}