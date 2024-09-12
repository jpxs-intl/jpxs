import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class InfoModule extends Module {
    name = "info";
    description = "jpxs info shit";

    getInfoModule(): InfoModule {
        return bot.moduleLoader.getModule("info") as InfoModule;
    }

}