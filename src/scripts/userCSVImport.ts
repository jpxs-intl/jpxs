import "dotenv/config.js";
import Database from "../database/index.js";
import loadCsvFile from "./util/csvUtil.js";
import Core from "../server/core.js";
import { Player } from "../database/entities/player.entity.js";
import { writeFileSync } from "fs";


(async () => {

    await Core.start({
        dry: true
    })

    const users = loadCsvFile<["phone_number", "description", "steam_id", "discord_id", "game_id", "last_seen", "first_seen", "supporter_level"]>("src/scripts/data/users.csv");

    // writeFileSync("src/scripts/data/users.json", JSON.stringify(users, null, 2));

    const existingPlayers = await Core.services.player.findAll();

    const players: Player[] = [];

    for (const user of users) {

        const existingPlayer = existingPlayers.find(p => p.gameId === parseInt(user.game_id));
        if (existingPlayer) {
            continue
        }

        const player = Core.services.player.create({
            phoneNumber: parseInt(user.phone_number),
            steamId: user.steam_id || undefined,
            gameId: parseInt(user.game_id),
            discordId: user.discord_id || undefined,
            supporterLevel: parseInt(user.supporter_level || "0"),
            firstSeen: new Date(user.first_seen || new Date().toISOString()),
            lastSeen: new Date(user.last_seen || new Date().toISOString()),
        });

        players.push(player);
    }

    Core.services.em.persistAndFlush(players);
})()