import Bot from "../bot";
import { BaseModuleType, CustomCommandBuilder } from "../loaders/loaderTypes";
import fs from "fs";
import path from "path";
import { Client } from "discord.js";
import chalk from "chalk";
import InteractionHandler from "../loaders/interactionHandler";
import Logger from "../utils/logger";

export default class Module implements BaseModuleType {
  name: string = "";
  description: string = "";

  private client?: Client;
  private commands: Map<string, CustomCommandBuilder> = new Map();
  private interactions: Map<string, InteractionHandler> = new Map();

  constructor(bot: Bot) {
    this.client = bot.client;
    if (process.env.SHOW_MODULE_LOAD_INFO === "true") {
      this.client.on("ready", () => {
        Logger.log("ModuleLoader", `${chalk.bold.blue(this.name)} loaded!`);
      });
    }
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
    Logger.log("ModuleLoader", `Unloaded module ${this.name}`);
    return true;
  }

  public async loadCommands() {
    if (!fs.existsSync(path.resolve(`./dist/server/discord/modules/${this.name}/commands`))) {
      Logger.log("CommandLoader", `No commands found for module ${this.name}, skipping...`);
      return [];
    }
    const commandFolder = fs.readdirSync(path.resolve(`./dist/server/discord/modules/${this.name}/commands`));

    let commands: CustomCommandBuilder[] = [];
    this.commands = new Map();

    for (const commandFile of commandFolder) {
      if (!commandFile.endsWith(".js")) continue;
      try {
        const command = require(path.resolve(`./dist/server/discord/modules/${this.name}/commands/${commandFile}`))
          .default as CustomCommandBuilder;
        command.setModule(this.name);
        commands.push(command);

        this.commands.set(command.getName(), command);
      } catch (e) {
        Logger.error("CommandLoader", `Error loading command ${commandFile} in module ${this.name}`);
      }
    }

    Logger.debug("CommandLoader", `Loaded ${commands.length} commands for module ${this.name}`);

    return commands;
  }

  public async loadInteractions() {
    if (!fs.existsSync(path.resolve(`./dist/server/discord/modules/${this.name}/interactions`))) {
      Logger.log("InteractionLoader", `No interactions found for module ${this.name}, skipping...`);
      return [];
    }

    const interactionFolder = fs.readdirSync(path.resolve(`./dist/modules/${this.name}/interactions`));

    let interactions: InteractionHandler[] = [];
    this.interactions = new Map();

    for (const interactionFile of interactionFolder) {
      if (!interactionFile.endsWith(".js")) continue;
      try {
        const interaction = require(path.resolve(
          `./dist/server/discord/modules/${this.name}/interactions/${interactionFile}`
        )).default as InteractionHandler;
        interaction.module = this.name;
        interactions.push(interaction);

        this.interactions.set(interaction.id, interaction);
      } catch (e) {
        Logger.error(
          "InteractionLoader",
          `Error loading interaction ${interactionFile} in module ${this.name}`
        );
      }
    }

    Logger.debug("InteractionLoader", `Loaded ${interactions.length} interactions for module ${this.name}`);
  }
}
