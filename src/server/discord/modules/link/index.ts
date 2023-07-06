import { bot } from "../../core";
import Module from "../../core/base/module";
import Logger from "../../core/utils/logger";

export default class LinkModule extends Module {
  name = "link";
  description = "The link commands for onebot";

  getLinkModule(): LinkModule {
    return bot.moduleLoader.getModule("link") as LinkModule;
  }

  override async onLoad(): Promise<boolean> {
    bot.client.on("guildMemberAdd", (member) => {
      console.log(member.user.username)
    });

    Logger.log("Link", "Loaded!")



    return true;
  }
}

