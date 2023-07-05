export default interface BanRequest {
    gameId: number;
    time: number | string;
    reason?: string;
    global?: boolean;
    ip?: boolean;
}