export default interface BanRequest {
    serverId: string;
    gameId: number;
    time: number | string;
    reason?: string;
    global?: boolean;
    ip?: boolean;
}