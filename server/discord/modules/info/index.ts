import { bot } from "../../core";
import Module from "../../core/base/module";

export default class InfoModule extends Module {
public name = "info";
public description = "No description provided";

public static getInfoModule(): InfoModule {
        return bot.moduleLoader.getModule("info") as InfoModule;
    }

}