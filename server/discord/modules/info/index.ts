import { bot } from "../../core";
import Module from "../../core/base/module";
import StatusImage from "./stats";

export default class InfoModule extends Module {
  public name = "info";
  public description = "No description provided";

  public static getInfoModule(): InfoModule {
    return bot.moduleLoader.getModule("info") as InfoModule;
  }

  public override async onLoad(): Promise<boolean> {
    StatusImage.init();
    return true;
  }
}
