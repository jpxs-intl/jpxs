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
}
/*
LEVEL 1: Default
- USE_JPXS
- SET_SERVER_ICON
- SET_SERVER_DESCRIPTION
- SET_SERVER_LINK
- PROVIDE_PLAYER_COUNT
- PROVIDE_BAN_LIST

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
