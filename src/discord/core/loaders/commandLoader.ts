import chalk from "chalk";
import { RESTPostAPIApplicationCommandsJSONBody, Routes, REST, Collection, Client } from "discord.js";
import Core, { bot } from "../index.js";
import { Logger } from "../../../utils/logger.js";
import { CustomCommandBuilder } from "./loaderTypes.js";
import { exec } from "child_process";
export default class CommandLoader {
  public client: Client;
  public commands: Collection<string, CustomCommandBuilder> = new Collection();
  public logger: Logger = new Logger("CommandLoader");

  constructor(client: Client) {
    this.client = client;
  }

  async load(commands: CustomCommandBuilder[]) {
    const applicationId = this.client.application?.id ?? this.client.user?.id ?? "unknown";

    // find duplicate command names, and determine if they are the same module (tsc compiler bug), or different modules (ovelapping command names)

    const duplicateCommandNames = commands.filter((command, index, self) => {
      return self.findIndex((c) => c.getName() === command.getName()) !== index;
    });

    if (duplicateCommandNames.length > 0) {
      // check if the duplicate commands are from the same module

      const duplicateCommandNamesFromSameModule = commands.filter((command, index, self) => {
        return (
          self.findIndex(
            (c) => c.getModule() === command.getModule() && c.getName() === command.getName()
          ) !== index
        );
      });

      if (duplicateCommandNamesFromSameModule.length > 0) {
        this.logger.error(
          `Duplicate command names found in module ${duplicateCommandNamesFromSameModule[0].getModule()}: ${duplicateCommandNamesFromSameModule}\nAttempting to remove duplicate commands...`
        );

      } else {
        const duplicateCommandNamesString = duplicateCommandNames
          .map((command) => command.getName())
          .join(", ");
        this.logger.error(
          `Duplicate command names found: ${duplicateCommandNamesString}. Please rename the commands to be unique.`
        );
        return;
      }
    }

    //Collect list of command files
    let commandsToDeploy: RESTPostAPIApplicationCommandsJSONBody[] = [];

    Core.config.get("showCommandDeploymentInfo") ? this.logger.log(`Deploying ${commands.length} command${commands.length == 1 ? "" : "s"}`) : null;

    //Import off of the commands as modules
    for (const command of commands) {
      this.commands.set(command.getName(), command);
      commandsToDeploy.push(command.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(
      (this.client.token as string) ?? (process.env.TOKEN as string)
    );

    this.client.application?.commands.set([]);

    //Push to Discord
    if (Core.config.get("commandRegisterMode") == "guild") {
      rest
        .put(Routes.applicationGuildCommands(applicationId, Core.config.get("guildId")), {
          body: commandsToDeploy,
        })
        .then(() => {
          Core.config.get("showCommandDeploymentInfo") ? this.logger.log(`${this.commands.size} command${this.commands.size == 1 ? "" : "s"} deployed`) : null;
        })
        .catch((err) => {
          this.logger.error(err);
        });
    } else {
      rest
        .put(Routes.applicationCommands(applicationId), {
          body: commandsToDeploy,
        })
        .then(() => {
          Core.config.get("showCommandDeploymentInfo") ? this.logger.log(`${this.commands.size} command${this.commands.size == 1 ? "" : "s"} deployed`) : null;
        })
        .catch((err) => {
          this.logger.log(err);
        });
    }

    this.showLoadedCommandCount();

    //Handle running commands, and direct them to the correct handler function
    this.client.on("interactionCreate", (interaction) => {
      // handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = this.commands.get(interaction.commandName);
        if (command && command.isChatInputCommandHandler()) command.handleAutocomplete(interaction);
      }

      if (!interaction.isCommand()) return; // Ignore non-command interactions
      if (interaction.replied) return; // Ignore interactions that have already been replied to

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.isChatInputCommand() && command.isChatInputCommandHandler())
        return command.run(interaction);
      if (!interaction.isChatInputCommand() && !command.isChatInputCommandHandler())
        return command.run(interaction);
    });
  }

  public unload(commands: CustomCommandBuilder[]) {
    for (const command of commands) {
      this.commands.delete(command.getName());
    }

    this.load(Array.from(this.commands.values()));
  }

  public showLoadedCommandCount() {
    if (!Core.config.get("showCommandCount")) return;
    const commands = Array.from(this.commands.values());

    const slashCommandCount = commands.filter((command) => command.getType() == "COMMAND").length;
    const userContextCommandCount = commands.filter((command) => command.getType() == "USER").length;
    const messageContextCommandCount = commands.filter((command) => command.getType() == "MESSAGE").length;

    const unusedSlashCommands = 100 - slashCommandCount;
    const unusedUserContextCommands = 5 - userContextCommandCount;
    const unusedMessageContextCommands = 5 - messageContextCommandCount;

    const char = "•";

    this.logger.log(
      [
        chalk.blue("Command Limits"),
        `Chat Input Commands:      [${chalk.green(char.repeat(slashCommandCount))}${chalk.red(
          char.repeat(unusedSlashCommands)
        )}] (${slashCommandCount}/100)`,
        `User Context Commands:    [${chalk.green(char.repeat(userContextCommandCount))}${chalk.red(
          char.repeat(unusedUserContextCommands)
        )}] (${userContextCommandCount}/5)`,
        `Message Context Commands: [${chalk.green(char.repeat(messageContextCommandCount))}${chalk.red(
          char.repeat(unusedMessageContextCommands)
        )}] (${messageContextCommandCount}/5)`,
      ].join("\n")
    );
  }
}
