import { Router } from "express";
import { bot, db } from "../../..";
import { Colors, EmbedBuilder, TextChannel } from "discord.js";
const router = Router();

export const recentIps: {
  ip: string;
  timestamp: number;
}[] = [];

router.get("/", (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

  if (ip) {
    recentIps.push({
      ip,
      timestamp: Date.now(),
    });
  }

  if (bot.client.isReady())
    (bot.client.channels.cache.get("1121641304988864554") as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`New jpxs.io request`)
          .setDescription(`IP: ${ip}\nWaiting for member join...`)
          .setTimestamp()
          .setColor(Colors.Blue),
      ],
    });

  res.redirect("https://gart.sh/jpxs");
});

export default router;
