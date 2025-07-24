import { Player } from "../../../database/entities/player.entity.js";
import { Logger } from "../../../utils/logger.js";
import Core from "../../core.js";
import PlayerManager from "./playerManager.js";

export default class AltManager {

    public static readonly logger = new Logger("AltManager");

    public static async findAlts(query: string, options?: {
        recursive?: boolean;
        depth?: number;
    }): Promise<{
        player: Player;
        sharedIps: string[];
    }[]> {
        const player = await PlayerManager.findPlayer(query, {
            populate: ["ips", "nameHistory"],
        });

        if (!player) {
            return [];
        }

        const sharedIps = player.ips.map(ip => ip.ip);

        const result = await this.findAltsByIpList(sharedIps, options?.recursive ? options.depth || 0 : 0);

        const players: {
            player: Player;
            sharedIps: string[];
        }[] = [];

        for (const alt of result.players) {

            if (players.find(p => p.player.gameId === alt.player.gameId)) {
                continue; // Skip if already found
            }

            players.push({
                player: alt.player,
                sharedIps: alt.sharedIps,
            });
        }

        return players;
    }

    public static async findAltsByIpList(ips: string[], depth = 0, limit = 5, prevResult?: AltFindResult): Promise<AltFindResult> {
        if (depth > limit) {
            return prevResult || {
                players: [],
                ips: {},
            }
        }

        try {

            AltManager.logger.debug(`Finding alts for IPs: ${ips.join(", ")}, depth: ${depth}`);

            const unsearchedIps = ips.filter(ip => !prevResult?.ips[ip]);
            if (unsearchedIps.length === 0) {
                return prevResult || {
                    players: [],
                    ips: {},
                };
            }

            const players = await Core.services.player.find({
                ips: {
                    ip: { $in: ips },
                },
            }, {
                populate: ["ips", "nameHistory"],
            });

            const result: AltFindResult = {
                players: [],
                ips: {},
            };

            for (const player of players) {
                if (prevResult && prevResult.players.some(res => res.player.gameId === player.gameId)) {
                    continue; // Skip if already found
                }

                const sharedIps = player.ips.map(ip => ip.ip).filter(ip => ips.includes(ip));
                if (sharedIps.length > 0) {
                    result.players.push({ player, sharedIps });

                    sharedIps.forEach(ip => {
                        if (!result.ips[ip]) {
                            result.ips[ip] = [];
                        }
                        result.ips[ip].push(player);
                    });
                }

                // Recursively find alts for shared IPs
                const alts = await this.findAltsByIpList(sharedIps, depth + 1, limit, result);
                result.players.push(...alts.players);
                result.ips = { ...result.ips, ...alts.ips };
            }



            return result;

        } catch (error) {
            AltManager.logger.error(`Error finding alts: ${error}`);
            return prevResult || {
                players: [],
                ips: {},
            };
        }
    }

}


interface AltFindResult {
    players: {
        player: Player;
        sharedIps: string[];
    }[],
    ips: {
        [ip: string]: Player[];
    }
}


