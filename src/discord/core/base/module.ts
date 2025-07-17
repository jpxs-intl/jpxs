import Bot from "../bot.js";
import { BaseModuleType, CustomCommandBuilder } from "../loaders/loaderTypes.js";
import fs from "fs";
import path from "path";
import { Client } from "discord.js";
import chalk from "chalk";
import InteractionHandler from "../loaders/interactionHandler.js";
import { Logger } from "../../../utils/logger.js";
import Core from "../index.js";
import ConfigProvider from "../utils/configProvider.js";

export default class Module<Config extends {
  [key: string]: any;
} = {}> implements BaseModuleType {
  name: string = "";
  description: string = "";

  private client?: Client;
  private commands: Map<string, CustomCommandBuilder> = new Map();
  private interactions: Map<string, InteractionHandler> = new Map();
  protected logger: Logger
  public config: ConfigProvider<Config>

  constructor(bot: Bot, public location: string = path.resolve("./dist/discord/modules/")) {
    this.client = bot.client;
    this.logger = new Logger(this.name);
    if (Core.config.get("showModuleLoadInfo")) {
      this.client.on("ready", () => {
        this.logger.log(`${chalk.bold.blue(this.name)} loaded!`);
      });
    }

    this.config = ConfigProvider.getModuleAccessor<Config>(this.name);
  }

  protected defaultConfig(defaultConfig: Config) {
    this.config.defaultConfig(defaultConfig);
  }

  /**
   * Override this method to run code when the module is loaded
   */
  async onLoad(): Promise<boolean> {
    return true;
  }

  /**
   * Override this method to run code when the module is unloaded
   */
  async onUnload(): Promise<Boolean> {
    this.logger.log(`Unloaded.`);
    return true;
  }

  public async loadCommands() {
    if (!fs.existsSync(path.resolve(this.location, `${this.name}/commands`))) {
      this.logger.log(`No commands found for this module, skipping... (${path.resolve(this.location, `${this.name}/commands`)})`);
      return [];
    }
    const commandFolder = fs.readdirSync(path.resolve(this.location, `${this.name}/commands`));

    let commands: CustomCommandBuilder[] = [];
    this.commands = new Map();

    for (const commandFile of commandFolder) {
      if (!commandFile.endsWith(".js")) continue;
      try {
        const command = (await import(path.resolve(this.location, `${this.name}/commands/${commandFile}`)))
          .default as CustomCommandBuilder;
        command.setModule(this.name);
        commands.push(command);

        this.commands.set(command.getName(), command);
      } catch (e) {
        this.logger.info("CommandLoader", `Error loading command ${commandFile}`);
        console.error(e);
      }
    }

    this.logger.debug(`Loaded ${commands.length} commands`);

    return commands;
  }

  public async loadInteractions() {
    if (!fs.existsSync(path.resolve(this.location, `${this.name}/interactions`))) {
      this.logger.log(`No interactions found for module this module, skipping...`);
      return [];
    }

    const interactionFolder = fs.readdirSync(path.resolve(`./dist/modules/${this.name}/interactions`));

    let interactions: InteractionHandler[] = [];
    this.interactions = new Map();

    for (const interactionFile of interactionFolder) {
      if (!interactionFile.endsWith(".js")) continue;
      try {
        const interaction = require(path.resolve(
          this.location, `${this.name}/interactions/${interactionFile}`
        )).default as InteractionHandler;
        interaction.module = this.name;
        interactions.push(interaction);

        this.interactions.set(interaction.id, interaction);
      } catch (e) {
        this.logger.error(
          "InteractionLoader",
          `Error loading interaction ${interactionFile}`
        );
      }
    }

    this.logger.debug(`Loaded ${interactions.length} interactions`);
  }
}
