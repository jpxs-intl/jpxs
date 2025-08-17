import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";
import StatusComponent from "./statusComponent.js";

export default class StatusModule extends Module {
    name = "status";
    description = "jpxs status embed shit";

    async onLoad(): Promise<boolean> {
        StatusComponent.init();
        return true;
    }

    getStatusModule(): StatusModule {
        return bot.moduleLoader.getModule("status") as StatusModule;
    }

}