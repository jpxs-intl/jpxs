import { OrderDefinition, Populate } from "@mikro-orm/core"
import Core from "../../core.js"
import { Player } from "../../../database/entities/player.entity.js"
import { Logger } from "../../../utils/logger.js";
import { EntityRepository } from "@mikro-orm/postgresql";

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
        limit?: number
    } = {
            populate: ["nameHistory"],
            orderBy: { lastSeen: "DESC", gameId: "DESC" },
            limit: 25
        }): Promise<Player | null> {
        if (!id) {
            throw new Error("Player ID is required.");
        }

        return await this.findPlayerWrapper(Core.services.player.findOne.bind(Core.services.player), id, options) as Player || null;
    }

    public static async findPlayers(id: string, options: {
        populate?: any | Populate<Player>,
        orderBy?: OrderDefinition<Player>,
        limit?: number
    } = {
            populate: ["nameHistory"],
            orderBy: { lastSeen: "DESC" },
            limit: 25
        }): Promise<Player[] | null> {
        if (!id) {
            throw new Error("Player ID is required.");
        }

        return (await this.findPlayerWrapper(Core.services.player.find.bind(Core.services.player), id, options)) as Player[] || null;
    }

    private static async findPlayerWrapper(method: EntityRepository<Player>["findOne" | "find"], id: string, options: {
        populate?: any | Populate<Player>,
        orderBy?: OrderDefinition<Player>,
    } = {
            populate: ["nameHistory"],
            orderBy: { lastSeen: "DESC" }
        }) {
        if (this.regex.isPhone.test(id)) {
            return await method({
                phoneNumber: parseInt(id.replace(/-/g, ""))
            }, options)
        } else if (this.regex.isSteamId.test(id)) {
            return await method({
                steamId: id
            }, options)
        } else if (this.regex.isDiscordId.test(id)) {
            return await method({
                discordId: id
            }, options)
        } else if (this.regex.isDigits.test(id)) {
            const res = await method({
                gameId: parseInt(id)
            }, options)

            if (res) {
                return res;
            }

            // try phone number as digits in case of abnormal phone number input...
            return await method({
                phoneNumber: parseInt(id)
            }, options)
        } else {
            return await method({
                nameHistory: {
                    name: {
                        $ilike: `%${id}%`
                    }
                }
            }, options)
        }
    }

}