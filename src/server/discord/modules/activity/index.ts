import { Client } from "discord.js";
import { bot, db } from "../../core";
import Module from "../../core/base/module";
import { ActivityUser } from "./entities/ActivityUser.entity";
import { ActivityUpdate } from "./entities/ActivityUpdate.entity";
import Logger from "../../../../utils/logger";

export default class ActivityModule extends Module {
name = "activity";
description = "The activity commands for onebot";

    getActivityModule(): ActivityModule {
        return bot.moduleLoader.getModule("activity") as ActivityModule;
    }

    async onLoad(): Promise<boolean> {

        const repo = db.em.getRepository(ActivityUpdate);
        const userRepo = db.em.getRepository(ActivityUser);
        
        bot.client.on("presenceUpdate", async (oldPresence, newPresence) => {
            if (!newPresence.user) return;
            if (oldPresence?.status === newPresence.status) return;

            let user = await userRepo.findOne(newPresence.user.id);
            if (!user) {
                const newUser = new ActivityUser(newPresence.user.id, newPresence.user.username);
                await userRepo.persistAndFlush(newUser);
                user = newUser;
            }

            const update = new ActivityUpdate(newPresence.status, user, newPresence.clientStatus || {});
            await repo.persistAndFlush(update);

            Logger.debug("Activity", `${newPresence.user.username} is now ${newPresence.status}`)
            
        });

        return true;
    }

}
