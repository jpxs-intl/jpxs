import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, GuildTextBasedChannel } from "discord.js"
import { User } from "../../../../database/entities/user.entity"
import Util from "../../../../utils/util"
import Utils from "../../core/utils/utils"
import CacheStorage from "../../../database/cacheStorage"
import DataStorage from "../../../data/dataStorage"
import { bot, db } from "../../../.."
import { AltIgnore } from "../../../../database/entities/altignore.entity"

export default async function sendAltMessage(serverId: string, joining: User, users: User[]) {
  const accOrder = users.sort((a, b) => a.gameId - b.gameId)
  const main = accOrder[0] || joining

  const ignore = await db.em.findOne(AltIgnore, {
    phoneNumber: joining.phoneNumber
  })

  if (ignore) return console.log("account is ignored")

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

  const embed = new EmbedBuilder()
    .setTitle("Alt Detected!")
    .setAuthor({
      name: liveData.name,
    })
    .setThumbnail(`https://avatars.jpxs.io/${joining.gameId}?size=256`)
    .setDescription([
      `${Util.formatUrlName(await joining.getName(), joining.gameId)} (${Util.formatPhoneNumber(joining.phoneNumber)}) is a suspected alt of ${Util.formatUrlName(await main.getName(), main.gameId)} (${Util.formatPhoneNumber(main.phoneNumber)})`,
      tracked.length == 0 ? "" : `\n**All Alts:**\n${(await Promise.all(tracked.map(async (u) => `${Util.formatUrlName(await u.getName(), u.gameId)} (${Util.formatPhoneNumber(u.phoneNumber)}) Seen ${Utils.discordTimestamp(u.lastSeen, "relative")}`))).join("\n")}`
    ].join("\n"))
    .setColor(Colors.Yellow)
    .setTimestamp()

  const channels = {
    "1090359735947100280": "1174419720028573706",
    // "1034582959661002842": "1200568336900165663"
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel("Add to ignore list")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`ignore:${joining.phoneNumber}`)
    )

  bot.buttonManager.registerButton(`ignore:${joining.phoneNumber}`, async (interaction) => {
    await db.em.persistAndFlush(new AltIgnore(joining.phoneNumber))
    await interaction.reply({
      content: `Added ${Util.formatPhoneNumber(joining.phoneNumber)} to the ignore list`,
      ephemeral: true
    })
  })

  Object.entries(channels).forEach(async ([serverId, channelId]) => {
    const guild = bot.client.guilds.cache.get(serverId);
    const channel = guild?.channels.cache.get(channelId) as GuildTextBasedChannel

    if (!channel) return

    await channel.send({
      content: `<@&1174447831692615781>`,
      embeds: [
        embed
      ],
      components: [row]
    })
  })

}