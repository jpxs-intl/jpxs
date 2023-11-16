import { Colors, EmbedBuilder, GuildTextBasedChannel } from "discord.js"
import { User } from "../../../../database/entities/user.entity"
import Util from "../../../../utils/util"
import Utils from "../../core/utils/utils"
import CacheStorage from "../../../database/cacheStorage"
import DataStorage from "../../../data/dataStorage"
import { bot } from "../../../.."

export default async function sendAltMessage(serverId: string, joining: User, users: User[]) {
  const accOrder = users.sort((a, b) => a.gameId - b.gameId)
  const main = accOrder[0] || joining

  console.log(accOrder.map((a) => a.phoneNumber))

  if (joining.gameId == main.gameId) return console.log("account is main")

  const serverData = await CacheStorage.servers.get(serverId)
  const liveData = DataStorage.servers.find((s) => s.id == serverId)

  if (!serverData || !liveData) return

  const otherAlts = users.filter((u) => u.gameId == joining.gameId || u.gameId == main.gameId)

  // remove duplicates

  const trackedAlts: number[] = []
  const tracked = otherAlts.filter((u) => {
    if (trackedAlts.includes(u.gameId)) return false
    trackedAlts.push(u.gameId)
    return true
  })

  console.log(tracked.map((u) => u.phoneNumber))

  const embed = new EmbedBuilder()
    .setTitle("Alt Detected!")
    .setAuthor({
      name: liveData.name,
    })
    .setThumbnail(`https://cityrp.jpxs.io/api/avatar/thumbnail?i=${joining.gameId}`)
    .setDescription([
      `${Util.formatUrlName(await joining.getName(), joining.gameId)} (${Util.formatPhoneNumber(joining.phoneNumber)}) is a suspected alt of ${Util.formatUrlName(await main.getName(), main.gameId)} (${Util.formatPhoneNumber(main.phoneNumber)})`,
      tracked.length == 0 ? "" : `\n**All Alts:**\n${(await Promise.all(tracked.map(async (u) => `${Util.formatUrlName(await u.getName(), u.gameId)} (${Util.formatPhoneNumber(u.phoneNumber)}) Seen ${Utils.discordTimestamp(u.lastSeen, "relative")}`))).join("\n")}`
    ].join("\n"))
    .setColor(Colors.Yellow)
    .setTimestamp()

  const guild = bot.client.guilds.cache.get("1090359735947100280");
  const channel = guild?.channels.cache.get("1174419720028573706") as GuildTextBasedChannel

  if (!channel) return

  await channel.send({
    content: `<@&1174447831692615781>`,
    embeds: [
      embed
    ]
  })
}