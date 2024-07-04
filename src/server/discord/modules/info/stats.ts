import fetch from "node-fetch";
import { exec } from "child_process";
import { bot, db } from "../../core";
import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import path from "path";
import Logger from "../../core/utils/logger";

export default class StatusImage {
  public static channelId: string = "1122986623307616288";
  public static messageId: string | null = null;
  private static statsEnabled: boolean = process.env.DEVELOPMENT !== "true";
  public static readonly emojis = {
    online: "🟢",
    offline: "🔴",
  };

  public static booleanData: {
    [key: string]: {
      name: string;
      checkFunction: () => Promise<boolean>;
    }[];
  } = {
      JPXS: [
        {
          name: "Core",
          checkFunction: async () => {
            const response = await fetch("https://jpxs.io/");
            return response.status === 200;
          },
        },
        {
          name: "API",
          checkFunction: async () => {
            const response = await fetch("https://jpxs.io/api/cache");
            return response.status === 200;
          },
        },
        {
          name: "Website",
          checkFunction: async () => {
            const response = await fetch("https://jpxs.io/");
            return response.status === 200;
          },
        },
        {
          name: "Bot",
          checkFunction: async () => {
            return true;
          },
        },
        {
          name: "Object Storage",
          checkFunction: async () => {
            const response = await fetch("https://assets.jpxs.io/");
            return response.status === 200;
          },
        },
        {
          name: "Image Proxy",
          checkFunction: async () => {
            const response = await fetch("https://camo.jpxs.io/");
            return response.status === 404;
          },
        },
        {
          name: "Analytics",
          checkFunction: async () => {
            const response = await fetch("https://stats.gart.sh/");
            return response.status === 200;
          },
        },
        {
          name: "Avatars",
          checkFunction: async () => {
            const response = await fetch("https://avatars.jpxs.io/");
            return response.status === 404;
          },
        },
      ],
      Masterservers: [
        {
          name: "Vanilla",
          checkFunction: async () => {
            const response = await fetch("http://crypticsea.com/anewzero/serverinfo.php").catch(() => ({ status: 500 }))
            return response.status === 200;
          },
        },
        {
          name: "RosaClassic",
          checkFunction: async () => {
            const response = await fetch("http://rosaclassic.xyz/anewzero/serverinfo.php").catch(() => ({ status: 500 }))
            return response.status === 200;
          },
        },
        {
          name: "Free Weekend",
          checkFunction: async () => {
            const response = await fetch("http://ms.jpxs.io/anewzero/serverinfo.php").catch(() => ({ status: 500 }))
            return response.status === 200;
          },
        },
      ],
      Servers: [
        {
          name: "System Node",
          checkFunction: async () => {
            return await this.pingServer("node1.gart.sh");
          },
        },
        {
          name: "JPXS Game Node",
          checkFunction: async () => {
            return await this.pingServer("dedi1.us.gart.sh");
          },
        },
        {
          name: "Outlaw Game Node",
          checkFunction: async () => {
            return await this.pingServer("dedi2.us.gart.sh");
          },
        },
        {
          name: "Hambugler Game Node",
          checkFunction: async () => {
            return await this.pingServer("dedi3.us.gart.sh");
          },
        },
        {
          name: "Ivory Game Node",
          checkFunction: async () => {
            return await this.pingServer("dedi4.us.gart.sh");
          },
        },
        {
          name: "Red Suit Game Node",
          checkFunction: async () => {
            return await this.pingServer("177.54.149.94");
          },
        }
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
    }).catch(() => false);
  }

  public static async statusText(): Promise<string> {

    let statusRows: string[] = [];

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

    booleanData.forEach((category, index) => {
      statusRows.push(`${index != 0 ? "\n" : ""}**${category.category}**`);
      category.items.forEach((item) => {
        statusRows.push(`  ${item.value ? this.emojis.online : this.emojis.offline} ${item.name}`);
      });
    })

    return statusRows.join("\n");
  }

  public static async updateStatusImage() {
    if (!this.statsEnabled) return;
    const channel = (await bot.client.channels.fetch(this.channelId)) as GuildTextBasedChannel;
    if (!channel || !channel.isTextBased()) return;
    const message = channel.messages.cache.get(this.messageId || "");

    const embed = new EmbedBuilder()
      .setTitle("JPXS Status")
      .setDescription(await this.statusText())
      .setColor(0x00ff00)
      .setTimestamp();

    if (!message) {
      await channel.bulkDelete(100);

      const newMessage = await channel.send({ embeds: [embed] });
      this.messageId = newMessage.id;
      return;
    }
    await message.edit({ embeds: [embed] });
  }

  public static async init() {

    if (process.env.DEVELOPMENT === "true") {
      Logger.warn("StatusEmbed", "Status embed is disabled in development mode!");
      return;
    }

    setTimeout(async () => {
      await this.updateStatusImage();
      setInterval(() => this.updateStatusImage(), 60000);
    }, 3000);
  }
}
