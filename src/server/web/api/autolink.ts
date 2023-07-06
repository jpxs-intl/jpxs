import { Router } from "express";
import { bot, db } from "../../../index";
import { Colors, EmbedBuilder, TextChannel } from "discord.js";
const router = Router();

export const recentIps: {
  ip: string;
  timestamp: number;
}[] = [];

router.get("/", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

  if (ip) {
    recentIps.push({
      ip,
      timestamp: Date.now(),
    });
  }

  if (bot.client.isReady()) {
    const rulesChannel = bot.client.guilds.cache.get(process.env.GUILD_ID as string)
      ?.rulesChannel as TextChannel;
    const inv = await bot.client.guilds.cache
      .get(process.env.GUILD_ID as string)
      ?.invites.create(rulesChannel, {
        maxUses: 1,
        unique: true,
        reason: `Autolink invite created for ${ip}`,
      });

    await (bot.client.channels.cache.get("1121641304988864554") as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`New jpxs.io request`)
          .setDescription(`IP: ${ip}\nInvite: ${inv?.code}\nWaiting for member join...`)
          .setTimestamp()
          .setColor(Colors.Blue),
      ],
    });

    res.redirect(inv?.url || "https://gart.sh/jpxs");
    return
  }

  res.redirect("https://gart.sh/jpxs");
});

export default router;
