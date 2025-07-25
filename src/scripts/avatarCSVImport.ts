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

    const avatars = loadCsvFile<["id", "sex", "head", "eyes", "hair", "hair_color", "skin"]>("src/scripts/data/avatars.csv");
    const avatarHistory = loadCsvFile<["id", "avatar_id", "player_phone_number", "date"]>("src/scripts/data/avatar_history.csv");

    const existingAvatars = await Core.services.avatar.findAll();

})()