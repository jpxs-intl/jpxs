import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";
import ChatStreamManager from "./chatStreamManager.js";

export default class InfoModule extends Module {
    name = "info";
    description = "jpxs info shit";

    async onLoad(): Promise<boolean> {

        ChatStreamManager.init();

        return true;
    }

    getInfoModule(): InfoModule {
        return bot.moduleLoader.getModule("info") as InfoModule;
    }

}