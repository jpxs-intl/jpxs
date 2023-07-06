#! /usr/bin/env node

import child_process from "child_process";
import chalk from "chalk";
import CreateModule from "./utils/createModule";
import fs from "fs";

const command = process.argv[2];
const args = process.argv.slice(3);

const cliCommand = "onebot";

const commands: {
  [key: string]: {
    description: string;
    usage: string;
    run: (args: string[]) => void;
  };
} = {
  start: {
    description: "Starts the bot",
    usage: "start",
    run: () => {
      console.log("Starting bot...");
      loadEnv();
      const proc = child_process.spawn("node dist/core/index.js", {
        shell: true,
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "production" },
      });
      fs.writeFileSync(".onebot.pid", proc.pid!.toString());
    },
  },
  debug: {
    description: "Starts the bot in debug mode",
    usage: "debug",
    run: () => {
      console.log("Starting bot in debug mode...");
      loadEnv();
      child_process.spawn("node dist/core/index.js", {
        shell: true,
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "development", DEBUG: "true" },
      });
    },
  },
  build: {
    description: "Builds the bot",
    usage: "build",
    run: () => {
      console.log("Building bot...");
      child_process.spawn("tsc", { shell: true, stdio: "inherit" });
    },
  },
  deploy: {
    description: "Deploys the bot",
    usage: "deploy",
    run: () => {
      console.log("Deploying bot...");
      fs.rmSync("dist", { recursive: true, force: true });
      child_process.spawn("tsc", { shell: true, stdio: "inherit" }).once("exit", () => {
        commands.start.run([]);
      });
    },
  },
  module: {
    description: "Manages modules",
    usage: "module <create|delete> <moduleName> <?moduleDescription>",
    run: (args: string[]) => {
      const subcommand = args[0];
      const moduleName = args[1];
      const moduleDescription = args.slice(2).join(" ");

      if (!subcommand || !moduleName) {
        console.log(chalk.red("Error: Missing arguments | Cancelling"));
        process.exit(1);
      }

      if (subcommand === "create") {
        console.log("Creating module...");
        CreateModule(moduleName, moduleDescription);
      } else if (subcommand === "delete") {
        console.log("Deleting module...");

        console.error("Not implemented yet");
        process.exit(1);
      }
    },
  },
  watch: {
    description: "Starts the typescript compiler in watch mode",
    usage: "watch",
    run: () => {
      console.log("Starting typescript compiler in watch mode...");
      child_process.spawn("tsc -w", { shell: true, stdio: "inherit" });
    },
  },
  restart: {
    description: "Restarts the bot",
    usage: "restart",
    run: () => {
      console.log("Restarting bot...");

      const pid = fs.readFileSync(".onebot.pid", "utf8");

      try {
        process.kill(parseInt(pid), "SIGINT");
      } catch (e) {
        console.log("Bot is not running");
      }
    },
  },
  stop: {
    description: "Stops the bot",
    usage: "stop",
    run: () => {
      console.log("Stopping bot...");

      const pid = fs.readFileSync(".onebot.pid", "utf8");

      try {
        process.kill(parseInt(pid), "SIGINT");
      } catch (e) {
        console.log("Bot is not running");
      }
    },
  },
};

if (commands.hasOwnProperty(command)) {
  commands[command].run(args);
} else {
  console.log(chalk.bold.red("Invalid command!"));
  printUsage();
}

function printUsage() {
  console.log("Available commands:");
  for (const commandName in commands) {
    console.log(
      `    ${chalk.green(commandName)} - ${chalk.blue(commands[commandName].description)}` +
        (commands[commandName].usage
          ? ` (Usage: ${chalk.yellow(`${cliCommand} ` + commands[commandName].usage)})`
          : "")
    );
  }
}

function loadEnv() {
  const conf = require("../config");
  let vars: {
    [key: string]: any;
  } = {};
  for (const key in conf) {
    vars[key] = conf[key];
    process.env[key] = conf[key];
  }

  return vars;
}

