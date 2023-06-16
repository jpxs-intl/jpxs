import { Client } from "discord.js";
import Bot from "./bot";
import ModuleLoader from "./loaders/moduleLoader";
import Logger from "./utils/logger";

export default class Core {
  public Client: Client;
  public bot: Bot;

  constructor(private _options: Core.OnebotOptions) {
    // @TODO manage options

    const intents = ModuleLoader.getIntents();
    this.Client = new Client({ intents });
    this.bot = new Bot(this.Client);

    this.Client.setMaxListeners(0);
    this.Client.login(this._options.token);

    this.Client.on("debug", (info) => {
      Logger.debug("Discord", info);
    });

    this.Client.on("warn", (info) => {
      Logger.debug("Discord", info);
    })
  }
}
