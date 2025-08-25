import { exec } from "child_process";
import Core from "../../../server/core.js";
import { Hosts } from "../../../server/types/hosts.js";
import { ActivityType, ButtonStyle, ChannelType, Colors, ComponentBuilder, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorSpacingSize } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";
import { bot } from "../../core/index.js";
import ClientManager from "../../../server/messaging/manager/clientManager.js";
import DataStorage from "../../../server/data/dataStorage.js";

export default class StatusComponent {
    public static channelId: string = "1122986623307616288";
    public static messageId?: string

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
                        return true;
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
                        return Core.botCore.Client.isReady();
                    },
                },
                {
                    name: "Downloads",
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
                    name: "Free Weekend",
                    checkFunction: async () => {
                        const response = await fetch("http://ms.jpxs.io/anewzero/serverinfo.php").catch(() => ({ status: 500 }))
                        return response.status === 200;
                    },
                },
            ],
            Servers: Object.entries(Hosts).map(([ip, data]) => ({
                name: data.name,
                checkFunction: async () => {
                    return await this.pingServer(ip);
                },
            })),
            Other: [
                {
                    name: "Database",
                    checkFunction: async () => {
                        return await Core.services.orm.isConnected();
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
                resolve(stdout.includes("1 received"));
                p.kill();
                p.unref();
                return;
            });
        }).catch(() => false);
    }

    public static async build() {

        const clientCount = Object.values(ClientManager.clients).length
        const serverCount = Object.keys(DataStorage.visible).length;
        const playerCount = Object.values(DataStorage.visible).reduce((acc, server) => acc + (server.playerCount || 0), 0);

        const [totalPlayerCount, totalSessionCount] = await Promise.all([
            await Core.services.player.count(),
            await Core.services.session.count(),
        ]);

        // see this isnt the place to do this but like i have all the data i need here sooo
        Core.botCore.Client.user?.setActivity({
            name: `${playerCount} players online`,
            type: ActivityType.Custom
        })

        const container = new ContainerBuilder()
            .setAccentColor(Colors.Green)
            .addTextDisplayComponents((text) =>
                text.setContent([
                    `# JPXS Status`,
                    `-# Updated <t:${Math.floor(Date.now() / 1000)}:R>`,
                    `-# Uptime: Started <t:${Math.floor(Core.startedAt / 1000)}:R>`,
                    `-# ${clientCount} connected client${clientCount === 1 ? '' : 's'}`,
                    `-# ${serverCount} server${serverCount === 1 ? '' : 's'} online`,
                    `-# ${playerCount} player${playerCount === 1 ? '' : 's'} online`,
                    `-# ${Intl.NumberFormat().format(totalPlayerCount)} total players tracked`,
                    `-# ${Intl.NumberFormat().format(totalSessionCount)} total sessions logged`,
                ].join('\n')))

        const results = await Promise.all(Object.entries(this.booleanData).map(async ([category, checks]) => {
            return {
                category,
                results: await Promise.all(checks.map(async (check) => {
                    const status = await check.checkFunction();
                    return {
                        name: check.name,
                        status,
                    };
                })),
            }
        }));

        results.forEach((categoryResults, index) => {
            container.addSeparatorComponents((separator) => separator
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
            );

            container.addTextDisplayComponents((text) => text.setContent(`# ${categoryResults.category}`));

            // split into sections of 5 items
            for (let i = 0; i < categoryResults.results.length; i += 5) {
                const items = categoryResults.results.slice(i, i + 5);

                container.addActionRowComponents((row) =>
                    row.addComponents(
                        ...items.map((item) => {
                            return new ButtonBuilder()
                                .setLabel(item.name)
                                .setCustomId(`status_${categoryResults.category}_${item.name}`)
                                .setStyle(item.status ? ButtonStyle.Success : ButtonStyle.Danger)
                            // .setDisabled(true);
                        }))
                );
            }

        });

        container.addTextDisplayComponents((text) => text.setContent(`\n\n-# no you cant click any of the these they just look nicer not disabled`));

        return container;

    }

    public static async update() {
        const channel = bot.client.channels.cache.get(this.channelId) || await bot.client.channels.fetch(this.channelId);
        if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

        if (this.messageId) {
            const message = channel.messages.cache.get(this.messageId) || await channel.messages.fetch(this.messageId).catch(() => null);

            if (message && message.editable) {
                await message.edit({
                    components: [await this.build()],
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                this.messageId = undefined;
            }

        } else {

            await channel.bulkDelete((await channel.messages.fetch({
                limit: 100,
            })).filter(msg => msg.author.id === bot.client.user?.id), true).catch(() => null);

            const message = await channel.send({
                components: [await this.build()],
                flags: MessageFlags.IsComponentsV2

            });

            this.messageId = message.id;
        }

    }

    public static async init() {
        setTimeout(async () => {
            await this.update();
            setInterval(async () => {
                await this.update();
            }, 60 * 1000); // Update every minute
        }, 1000);
    }

}