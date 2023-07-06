import { bot } from "../../core";
import Module from "../../core/base/module";

export default class CoreModule extends Module {
name = "core";
description = "The core commands for onebot";

    getCoreModule(): CoreModule {
        return bot.moduleLoader.getModule("core") as CoreModule;
    }

}