import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./managers/buttonManager";
import SelectMenuManager from "./managers/selectMenuManager";
import ModalManager from "./managers/modalManager";
import Logger from "./utils/logger";
import { usage } from "./utils/usage";

export default class Bot {
  commandLoader: CommandLoader;
  moduleLoader: ModuleLoader;

  buttonManager: ButtonManager;
  selectMenuManager: SelectMenuManager;
  modalManager: ModalManager;

  loadStatus: {
    commands: boolean;
    modules: boolean;
  } = {
    commands: false,
    modules: false,
  };

  constructor(public client: Client) {
    this.client.on("ready", () => {
      Logger.info("Core", `Logged in as ${this.client.user?.tag}`);
      this.moduleLoader.onReady();
    });

    this.commandLoader = new CommandLoader(this.client);
    this.moduleLoader = new ModuleLoader(this);

    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);
  }

  public async restart() {
    const { spawn } = require("child_process");
    spawn("npm", ["run", "cli", "restart"], {
      stdio: "inherit",
    });
  }

  public updateLoadStatus() {
    if (this.loadStatus.commands && this.loadStatus.modules) {
      Logger.info("Core", "All modules and commands loaded!");

      if (process.env.SEND_USAGE_DATA === "true") usage.sendData();
    }
  }
}
