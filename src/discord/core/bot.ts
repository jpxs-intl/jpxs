import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader.js";
import CommandLoader from "./loaders/commandLoader.js";
import ButtonManager from "./managers/buttonManager.js";
import SelectMenuManager from "./managers/selectMenuManager.js";
import ModalManager from "./managers/modalManager.js";
import { Logger } from "../../utils/logger.js";

export default class Bot {
  public commandLoader: CommandLoader;
  public moduleLoader: ModuleLoader;

  public buttonManager: ButtonManager;
  public selectMenuManager: SelectMenuManager;
  public modalManager: ModalManager;

  public logger = new Logger("Bot");

  public loadStatus: {
    commands: boolean;
    modules: boolean;
  } = {
      commands: false,
      modules: false,
    };

  constructor(public client: Client) {
    this.client.on("ready", () => {
      this.logger.info(`Logged in as ${this.client.user?.tag}`);
      this.moduleLoader.onReady();
    });

    this.commandLoader = new CommandLoader(this.client);
    this.moduleLoader = new ModuleLoader(this, "./dist/discord/modules", "./src/discord/modules");

    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);
  }

  public async init() {
    this.moduleLoader.loadModules();
  }

  public updateLoadStatus() {
    if (this.loadStatus.commands && this.loadStatus.modules) {
      this.logger.info("All modules and commands loaded!");
    }
  }
}
