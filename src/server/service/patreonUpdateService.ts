import { config } from "dotenv";
config();

import "../../index";
import Logger from "../../utils/logger";
import { db } from "../../index";
import { User } from "../../database/entities/user.entity";
import { getUserLevel } from "../types/patreonLevels";
import { bot } from "../discord/core";

Logger.info("Script", "Waiting 10 seconds for init...");

setTimeout(async () => {
  Logger.info("Script", "Starting Patreon update...");

  const linkedUsers = await db.em.find(User, {
    discordId: {
        $ne: null,
    },
  });

  Logger.info("Script", `Found ${linkedUsers.length} users with a Discord account`);

  const users = await Promise.all(
    linkedUsers.map(async (user): Promise<User> => {
      return new Promise<User>(async (resolve) => {
        const member = await bot.client.guilds.cache
          .get(process.env.GUILD_ID as string)
          ?.members.fetch(user.discordId as string).catch(() => null);
        if (!member) return resolve(user);
        const level = getUserLevel(member);

        await user.nameHistory.init();
        

        if (level == user.supporterLevel) {
            Logger.info("Script", `${user.nameHistory.getItems()[0].name} is already at the correct Patreon level`);
            return resolve(user);
        }

        Logger.info("Script", `Updating ${user.nameHistory.getItems()[0].name}'s Patreon level to ${level}`);

        user.supporterLevel = level;

        await db.em.persistAndFlush(user);
     });
    })
  );

    Logger.info("Script", "Patreon update complete");

    const filtered = users.filter((user) => user.supporterLevel > 0);

    Logger.info("Script", `Found ${filtered.length} users with a Patreon level`);

    console.log(JSON.stringify(filtered.map((user) => user.phoneNumber)))

}, 10000);
