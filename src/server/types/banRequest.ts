export default interface PunishmentRequest {
    serverId: string;
    user: string | number
    type: "ban" | "ipBan" | "globalBan" | "mute" | "globalMute" | "kick" | "warning" | "unban" | "unmute";
    creator: number;
    time: number | string;
    reason?: string;
    global?: boolean;
    ip?: boolean;
}