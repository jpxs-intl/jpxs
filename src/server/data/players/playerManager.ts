import { OrderDefinition, Populate } from "@mikro-orm/core"
import Core from "../../core.js"
import { Player } from "../../../database/entities/player.entity.js"
import { Logger } from "../../../utils/logger.js";

export default class PlayerManager {

    private static logger = new Logger("PlayerManager");

    public static regex = {
        // either xxx-xxxx or xxxxxxx
        isPhone: /^(?:\d{3}-\d{4}|\d{7})$/,
        // is Steam ID
        isSteamId: /^(?:STEAM_0:\d:\d{1,2}|[0-9]{17})$/,
        // is Discord ID
        isDiscordId: /^\d{17,19}$/,
        // all digits
        isDigits: /^\d+$/,
    }

    public static async closeSessions() {
        // end open sessions

        const openSessions = await Core.services.session.find({
            endedAt: null,
        }, {
            populate: ["player", "server"],
        });

        for (const session of openSessions) {
            session.endedAt = new Date();
        }

        await Core.services.em.flush();
        this.logger.info(`Ended ${openSessions.length} open sessions.`);

    }

    public static async findPlayer(id: string, options: {
        populate?: any | Populate<Player>,
        orderBy?: OrderDefinition<Player>,
    } = {
            populate: ["nameHistory"],
            orderBy: { lastSeen: "DESC" }
        }) {
        if (this.regex.isPhone.test(id)) {
            return await Core.services.player.findOne({
                phoneNumber: parseInt(id.replace(/-/g, ""))
            }, options)
        } else if (this.regex.isSteamId.test(id)) {
            return await Core.services.player.findOne({
                steamId: id
            }, options)
        } else if (this.regex.isDiscordId.test(id)) {
            return await Core.services.player.findOne({
                discordId: id
            }, options)
        } else if (this.regex.isDigits.test(id)) {
            return await Core.services.player.findOne({
                gameId: parseInt(id)
            }, options)
        } else {
            return await Core.services.player.findOne({
                nameHistory: {
                    name: {
                        $ilike: `%${id}%`
                    }
                }
            }, options)
        }
    }

}