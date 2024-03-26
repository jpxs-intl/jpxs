export enum KeyPerms {
    NONE = 0,
    USE_JPXS = 2 ** 0,
    SET_SERVER_ICON = 2 ** 1,
    SET_SERVER_DESCRIPTION = 2 ** 2,
    SET_SERVER_LINK = 2 ** 3,
    PROVIDE_PLAYER_COUNT = 2 ** 4,
    PROVIDE_PLAYER_LIST = 2 ** 5,
    PROVIDE_PLAYER_STATUS = 2 ** 6,
    PROVIDE_PLAYER_AVATARS = 2 ** 7,
    PROVIDE_PLAYER_IPS = 2 ** 8,
    PROVIDE_PLAYER_NAMES = 2 ** 9,
    PROVIDE_STEAM_IDS = 2 ** 10,
    PROVIDE_BAN_LIST = 2 ** 11,
    PROVIDE_DISCORD_LINK = 2 ** 12,
    GLOBAL_BAN_USERS = 2 ** 13,
    GLOBAL_MUTE_USERS = 2 ** 14,
    GLOBAL_UNBAN_USERS = 2 ** 15,
    GLOBAL_UNMUTE_USERS = 2 ** 16,
    USE_GLOBAL_BAN_LIST = 2 ** 17,
    RECIEVE_MESSAGES = 2 ** 18,
    RECIEVE_EXECS = 2 ** 19,
}
/*
LEVEL 1: Default
- USE_JPXS
- SET_SERVER_ICON
- SET_SERVER_DESCRIPTION
- SET_SERVER_LINK
- PROVIDE_PLAYER_COUNT
- PROVIDE_BAN_LIST
- RECIEVE_MESSAGES
- RECIEVE_EXECS
 
LEVEL 2: Trusted
- USE_JPXS
- SET_SERVER_ICON
- SET_SERVER_DESCRIPTION
- SET_SERVER_LINK
- PROVIDE_PLAYER_COUNT
- PROVIDE_PLAYER_LIST
- PROVIDE_PLAYER_STATUS
- PROVIDE_PLAYER_AVATARS
- PROVIDE_PLAYER_NAMES
- PROVIDE_BAN_LIST
- PROVIDE_DISCORD_LINK
- USE_GLOBAL_BAN_LIST
- RECIEVE_MESSAGES
- RECIEVE_EXECS
 
LEVEL 3: Admin
- USE_JPXS
- SET_SERVER_ICON
- SET_SERVER_DESCRIPTION
- SET_SERVER_LINK
- PROVIDE_PLAYER_COUNT
- PROVIDE_PLAYER_LIST
- PROVIDE_PLAYER_STATUS
- PROVIDE_PLAYER_AVATARS
- PROVIDE_PLAYER_IPS
- PROVIDE_PLAYER_NAMES
- PROVIDE_STEAM_IDS
- PROVIDE_BAN_LIST
- PROVIDE_DISCORD_LINK
- GLOBAL_BAN_USERS
- GLOBAL_BAN_IPS
- GLOBAL_UNBAN_USERS
- GLOBAL_UNBAN_IPS
- USE_GLOBAL_BAN_LIST
- RECIEVE_MESSAGES
- RECIEVE_EXECS
    
*/

export const KeyPermsNames = {
    [KeyPerms.NONE]: "None",
    [KeyPerms.USE_JPXS]: "Use JPXS",
    [KeyPerms.SET_SERVER_ICON]: "Set Server Icon",
    [KeyPerms.SET_SERVER_DESCRIPTION]: "Set Server Description",
    [KeyPerms.SET_SERVER_LINK]: "Set Server Link",
    [KeyPerms.PROVIDE_PLAYER_COUNT]: "Provide Player Count",
    [KeyPerms.PROVIDE_PLAYER_LIST]: "Provide Player List",
    [KeyPerms.PROVIDE_PLAYER_STATUS]: "Provide Player Status",
    [KeyPerms.PROVIDE_PLAYER_AVATARS]: "Provide Player Avatars",
    [KeyPerms.PROVIDE_PLAYER_IPS]: "Provide Player IPs",
    [KeyPerms.PROVIDE_PLAYER_NAMES]: "Provide Player Names",
    [KeyPerms.PROVIDE_STEAM_IDS]: "Provide Steam IDs",
    [KeyPerms.PROVIDE_BAN_LIST]: "Provide Ban List",
    [KeyPerms.PROVIDE_DISCORD_LINK]: "Provide Discord Link",
    [KeyPerms.GLOBAL_BAN_USERS]: "Global Ban Users",
    [KeyPerms.GLOBAL_MUTE_USERS]: "Global Mute Users",
    [KeyPerms.GLOBAL_UNBAN_USERS]: "Global Unban Users",
    [KeyPerms.GLOBAL_UNMUTE_USERS]: "Global Unmute Users",
    [KeyPerms.USE_GLOBAL_BAN_LIST]: "Use Global Ban List",
    [KeyPerms.RECIEVE_MESSAGES]: "Recieve Messages",
    [KeyPerms.RECIEVE_EXECS]: "Recieve Execs",
} as const;

export const KeyPermsLevels = {
    [KeyPerms.NONE]: 0,
    [KeyPerms.USE_JPXS]: 1,
    [KeyPerms.SET_SERVER_ICON]: 1,
    [KeyPerms.SET_SERVER_DESCRIPTION]: 1,
    [KeyPerms.SET_SERVER_LINK]: 1,
    [KeyPerms.PROVIDE_PLAYER_COUNT]: 1,
    [KeyPerms.PROVIDE_PLAYER_LIST]: 2,
    [KeyPerms.PROVIDE_PLAYER_STATUS]: 2,
    [KeyPerms.PROVIDE_PLAYER_AVATARS]: 2,
    [KeyPerms.PROVIDE_PLAYER_IPS]: 3,
    [KeyPerms.PROVIDE_PLAYER_NAMES]: 2,
    [KeyPerms.PROVIDE_STEAM_IDS]: 2,
    [KeyPerms.PROVIDE_BAN_LIST]: 1,
    [KeyPerms.PROVIDE_DISCORD_LINK]: 2,
    [KeyPerms.GLOBAL_BAN_USERS]: 3,
    [KeyPerms.GLOBAL_MUTE_USERS]: 3,
    [KeyPerms.GLOBAL_UNBAN_USERS]: 3,
    [KeyPerms.GLOBAL_UNMUTE_USERS]: 3,
    [KeyPerms.USE_GLOBAL_BAN_LIST]: 2,
    [KeyPerms.RECIEVE_MESSAGES]: 1,
    [KeyPerms.RECIEVE_EXECS]: 1,
} as const;

export const KeyPermsLevelsNames = {
    0: "None",
    1: "Default",
    2: "Trusted",
    3: "Admin",
};

export function getPerms(level: number): number {
    return Number(
        Object.keys(KeyPermsLevels)
            // @ts-ignore
            .filter((key) => KeyPermsLevels[key] <= level)
            .map((key) => parseInt(key))
            .reduce((acc, curr) => acc | BigInt(curr), 0n)
    );
}