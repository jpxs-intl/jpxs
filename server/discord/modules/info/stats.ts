import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import fetch from "node-fetch";
import { exec } from "child_process";
import { bot, db } from "../../core";
import { AttachmentBuilder, GuildTextBasedChannel } from "discord.js";
import path from "path";
import Logger from "../../core/utils/logger";
import DataStorage from "../../../data/dataStorage";
import CacheStorage from "../../../database/cacheStorage";

export default class StatusImage {
  public static channelId: string = "1122986623307616288";
  public static messageId: string | null = null;

  public static booleanData: {
    [key: string]: {
      name: string;
      checkFunction: () => Promise<boolean>;
    }[];
  } = {
    JPXS: [
      {
        name: "JPXS",
        checkFunction: async () => {
          const response = await fetch("https://jpxs.international/");
          return response.status === 200;
        },
      },
      {
        name: "JPXS API",
        checkFunction: async () => {
          const response = await fetch("https://jpxs.international/api/cache");
          return response.status === 200;
        },
      },
      {
        name: "jpxs.io",
        checkFunction: async () => {
          const response = await fetch("https://jpxs.io/");
          return response.status === 200;
        },
      },
      {
        name: "JPXS Bot",
        checkFunction: async () => {
          return true;
        },
      },
    ],
    Masterservers: [
      {
        name: "Vanilla",
        checkFunction: async () => {
          const response = await fetch("http://crypticsea.com/anewzero/serverinfo.php");
          return response.status === 200;
        },
      },
      {
        name: "RosaClassic",
        checkFunction: async () => {
          const response = await fetch("http://rosaclassic.xyz/anewzero/serverinfo.php");
          return response.status === 200;
        },
      },
      {
        name: "Suitium",
        checkFunction: async () => {
          const response = await fetch("http://ms.jpxs.io/anewzero/serverinfo.php");
          return response.status === 200;
        },
      },
    ],
    Servers: [
      {
        name: "System Node [vps1]",
        checkFunction: async () => {
          return await this.pingServer("node1.gart.sh");
        },
      },
      {
        name: "Game Node   [vds1]",
        checkFunction: async () => {
          return await this.pingServer("dedi1.gart.sh");
        },
      },
    ],
    Other: [
      {
        name: "Database",
        checkFunction: async () => {
          if (!db) return false;
          return await db.getOrm().isConnected();
        },
      },
      {
        name: "HTTP Proxy",
        checkFunction: async () => {
          const response = await fetch("https://gart.sh/");
          return response.status === 200;
        },
      },
    ],
  };

  public static serverIds: string[] = [
    "cliunmonu3ow77qkh257kcaix",
    "cliwl8jdz0ctppc22ass6635g",
    "cliwl8jak0cthpc225sq5fg3j",
  ];

  public static async pingServer(host: string) {
    return new Promise<boolean>((resolve, reject) => {
      const p = exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return false;
        }
        Logger.debug("StatusEmbed", stdout);
        resolve(stdout.includes("1 received"));
        p.kill();
        p.unref();
        return;
      });
    });
  }

  public static async makeImage(): Promise<Buffer> {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext("2d");

    // fetch true/false data

    const booleanData = await Promise.all(
      Object.entries(this.booleanData).map(async ([category, items]) => {
        return {
          category,
          items: await Promise.all(
            items.map(async (item) => {
              return {
                name: item.name,
                value: await item.checkFunction(),
              };
            })
          ),
        };
      })
    );

    // draw background

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1920, 1080);

    // draw title
    ctx.font = "bold 100px Space Mono Bold";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("JPXS Status", 100, 100);

    // draw boolean data

    ctx.font = "bold 50px Space Mono";
    ctx.fillStyle = "#ffffff";

    let y = 200;

    for (const category of booleanData) {
      ctx.fillText(category.category, 100, y);
      y += 50;
      for (const item of category.items) {
        const color = item.value ? "#00ff00" : "#ff0000";
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(125, y - 20, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(item.name, 150, y);

        y += 50;
      }
      y += 50;
    }

    // draw server data

    ctx.font = "bold 50px Space Mono";
    ctx.fillStyle = "#ffffff";

    y = 200;

    for (const serverId of StatusImage.serverIds) {
      const server = DataStorage.servers.find((s) => s.id === serverId);
      if (!server) {
        const staleData = await CacheStorage.snapshots
          .getServerSnapshots(serverId)
          .then((snapshots) => snapshots[0]);
        if (!staleData) continue;

        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(880, y - 20, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(staleData.name, 900, y);
        y += 50;

        ctx.fillText(`Server Offline`, 950, y);
        y += 100;
        continue;
      }

      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(880, y - 20, 10, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(server.name, 900, y);
      y += 50;

      ctx.fillText(`Players: ${server.players}/${server.maxPlayers}`, 950, y);
      y += 100;
    }

    return canvas.toBuffer("image/png");
  }

  public static async updateStatusImage() {
    const channel = (await bot.client.channels.fetch(this.channelId)) as GuildTextBasedChannel;
    if (!channel || !channel.isTextBased()) return;
    const message = channel.messages.cache.get(this.messageId || "");

    const attachment = new AttachmentBuilder(await this.makeImage(), {
      name: "status.png",
    });

    if (!message) {
      await channel.bulkDelete(100);

      const newMessage = await channel.send({ files: [attachment] });
      this.messageId = newMessage.id;
      return;
    }
    await message.edit({ files: [attachment] });
  }

  public static async init() {
    GlobalFonts.registerFromPath(
      path.resolve("./assets/fonts/spacemono/SpaceMono-Bold.ttf"),
      "Space Mono Bold"
    );
    GlobalFonts.registerFromPath(
      path.resolve("./assets/fonts/spacemono/SpaceMono-Regular.ttf"),
      "Space Mono"
    );
    GlobalFonts.registerFromPath(
      path.resolve("./assets/fonts/spacemono/SpaceMono-Italic.ttf"),
      "Space Mono Italic"
    );
    GlobalFonts.registerFromPath(
      path.resolve("./assets/fonts/spacemono/SpaceMono-BoldItalic.ttf"),
      "Space Mono Bold Italic"
    );

    setTimeout(async () => {
      await this.updateStatusImage();
      setInterval(() => this.updateStatusImage(), 60000);
    }, 3000);
  }
}
