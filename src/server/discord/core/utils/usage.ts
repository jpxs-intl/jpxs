import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import os from "os";
import Logger from "./logger";

export default class UsageData {
  public data: {
    [key: string]: any;
  } = {};

  public static readonly DATA_PATH = path.resolve("src/server/discord/core/data/usage.json");

  constructor() {
    const data = UsageData.getPersistentData();
    if (data.firstRun) {
      UsageData.createPersistentData();
    }

    this.data = data;

    this.data.shell = process.env.SHELL;
    this.data.os = process.platform;
    this.data.node = process.version;
    this.data.arch = process.arch;
    this.data.cpu = process.cpuUsage();
    this.data.memory = process.memoryUsage();
    this.data.totalMemory = os.totalmem();
    this.data.freeMemory = os.freemem();
    this.data.cpus = os.cpus();
    this.data.type = os.type();
    this.data.release = os.release();
    this.data.uptime = process.uptime();
    this.data.packages = Object.keys(require(path.resolve("package.json")).dependencies).join(", ");
    this.data.commandMode = process.env.COMMAND_MODE;
    this.data.pkgname = process.env.npm_package_name;
    this.data.pkgversion = process.env.npm_package_version;
  }

  public static createPersistentData() {
    const data = {
      firstRun: false,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    };

    fs.mkdirSync(path.resolve("src/server/discord/core/data"), { recursive: true });
    fs.writeFileSync(UsageData.DATA_PATH, JSON.stringify(data));

    if (process.env.SEND_USAGE_DATA === "false") {
        Logger.log("UsageData", "Usage data collection is disabled. You can enable it by setting SEND_USAGE_DATA in the config to true.");
        Logger.log("UsageData", "This is the only time you will see this message.");
    }
  }

  public static getPersistentData() {
    if (!fs.existsSync(UsageData.DATA_PATH)) {
        return { firstRun: true };
    }
    const data = fs.readFileSync(this.DATA_PATH, "utf8");
    return JSON.parse(data);
  }

  public static updatePersistentData(data: any) {
    fs.writeFileSync(UsageData.DATA_PATH, JSON.stringify(data));
  }

  public sendData() {
    fetch("https://stats.gart.sh/onebot/usage", {
      method: "POST",
      body: JSON.stringify(this.data),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.status !== 200) {
          Logger.debug("UsageData", `Failed to send usage data. Status: ${res.status}`);
        }
      })
      .catch((err) => {
        Logger.debug("UsageData", `Failed to send usage data. Error: ${err}`);
      });
  }
}

export const usage = new UsageData();
