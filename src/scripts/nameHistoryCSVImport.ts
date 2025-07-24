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

    const nameHistory = loadCsvFile<["id", "player_phone_number", "date", "name"]>("src/scripts/data/name_history.csv");


    // writeFileSync("src/scripts/data/users.json", JSON.stringify(users, null, 2));

    const existingPlayers = await Core.services.player.findAll({
        populate: ["nameHistory"]
    });

    const nameHistoryEntries = [];

    for (const entry of nameHistory) {
        const player = existingPlayers.find(p => p.phoneNumber === parseInt(entry.player_phone_number));
        if (!player) {
            continue;
        }

        const existingNameHistory = player.nameHistory.getItems().find(nh => nh.name === entry.name && nh.createdAt.toISOString() === entry.date);
        if (existingNameHistory) {
            continue;
        }

        const nameHistoryEntry = Core.services.nameHistory.create({
            player: player,
            name: entry.name,
            createdAt: new Date(entry.date),
            updatedAt: new Date(entry.date),
        });

        nameHistoryEntries.push(nameHistoryEntry);
    }

    Core.services.em.persistAndFlush(nameHistoryEntries);
})()