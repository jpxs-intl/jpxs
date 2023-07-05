import { GuildMember } from "discord.js"

export const patreonLevels = {
    "1118939708609810583": 1, // Supporter
    "1090419341461299241": 2, // Discord Booster
    "1118939808379719791": 3, // Alex Austin
    "1118939882396590110": 4  // Alex Awesome
} as Record<string, number>

export const getUserLevel = (member: GuildMember) => {
    const roleManager = member.roles
    let userLevel = 0
   
    for (const k in patreonLevels) {
        if (roleManager.cache.has(k) && patreonLevels[k] > userLevel ) {
            userLevel = patreonLevels[k]
        }
    }

    return userLevel
}
