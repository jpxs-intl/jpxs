import { ChannelType, GuildTextBasedChannel, TextBasedChannel, TextChannel, Webhook, WebhookType } from "discord.js";
import { DataChannel } from "../../../server/messaging/channels/data.js";
import ClientManager from "../../../server/messaging/manager/clientManager.js";
import { Logger } from "../../../utils/logger.js";
import Core from "../../../index.js"
import InstructionManager from "../../../server/data/instructionManager.js";

export default class ChatStreamManager {

    public static readonly streams: Record<string, string> = {}; // <serverId, channelId>
    public static readonly bidirectionalStreams: Record<string, string> = {}; // <serverId, channelId>
    public static readonly hooks: Record<string, Webhook> = {}; // <serverId, webhook>
    public static logger = new Logger("ChatStreamManager");

    public static async init() {
        DataChannel.subscribeToEvent("jpxs.ChatStreamManager", "player:chat", async (data) => {
            const serverId = ClientManager.getClient(data.sender)?.name;
            if (!serverId || !ChatStreamManager.streams[serverId]) {
                return;
            }

            const channelId = ChatStreamManager.streams[serverId];
            const channel = (Core.botCore.bot.client.channels.cache.get(channelId) || await Core.botCore.bot.client.channels.fetch(channelId)) as TextChannel | null;

            if (!channel || !channel.isTextBased()) {
                ChatStreamManager.logger.error(`Channel ${channelId} not found or is not a text channel.`);
                delete ChatStreamManager.streams[serverId];

                return;
            }

            const webhook = await ChatStreamManager.getWebhook(channel);
            if (!webhook) {
                ChatStreamManager.logger.error(`Webhook for channel ${channelId} not found or could not be created.`);
                return;
            }

            const user = await Core.services.player.findOne({ gameId: data.subRosaID });
            if (!user) {
                ChatStreamManager.logger.error(`User with gameId ${data.subRosaID} not found.`);
                return;
            }

            await webhook.send({
                content: data.message,
                username: await user.getName(),
                avatarURL: `https://avatars.jpxs.io/${data.subRosaID}?size=64`,
                allowedMentions: {
                    roles: [],
                    users: [],
                }
            }).catch(err => {
                ChatStreamManager.logger.error(`Failed to send message to channel ${channelId}: ${err}`);
            });
        });

        Core.botCore.bot.client.on("messageCreate", async (message) => {
            if (message.author.bot || !message.guild || !message.channel || !message.author) return;
            const channel = message.channel as TextBasedChannel;
            if (channel.type !== ChannelType.GuildText) return;

            const serverId = Object.keys(ChatStreamManager.streams).find(id => ChatStreamManager.streams[id] === channel.id);
            if (!serverId || !ChatStreamManager.bidirectionalStreams[serverId]) return;

            InstructionManager.announce(`[${message.author.username}]: ${message.content}`, serverId);
        })
    }

    private static async getWebhook(channel: TextChannel): Promise<Webhook> {
        if (ChatStreamManager.hooks[channel.id]) {
            return ChatStreamManager.hooks[channel.id];
        }

        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.find(wh => wh.name === "jpxsbeta");

        if (webhook) {
            ChatStreamManager.hooks[channel.id] = webhook;
            return webhook;
        }

        const newHook = await channel.createWebhook({
            name: "jpxsbeta",
            avatar: Core.botCore.bot.client.user?.displayAvatarURL(),
            reason: "Needed this here, thanks :3"
        });

        ChatStreamManager.hooks[channel.id] = newHook;
        return newHook;
    }

}