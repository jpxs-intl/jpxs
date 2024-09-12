import fs from "fs";
import path from "path";
import { Logger } from "../../../utils/logger.js";

export default class ConfigProvider<
  ConfigValues extends {
    [key: string]: any;
  } = {}
> {
  private static config: { [module: string]: { [key: string]: any } } = {};
  private static readonly configPath = path.resolve("./src/discord/config.json");
  private static isLoaded = false;
  private static logger = new Logger("ConfigProvider");

  private constructor(private readonly moduleName: string) { }

  public static getModuleAccessor<T extends { [key: string]: any }>(moduleName: string): ConfigProvider<T> {
    return new ConfigProvider<T>(moduleName);
  }

  public defaultConfig(defaultConfig: ConfigValues): void {
    if (!ConfigProvider.isLoaded) ConfigProvider.loadConfig();
    const moduleConfig = this.getModuleConfig();

    for (const key in defaultConfig) {
      if (moduleConfig[key] === undefined) {
        moduleConfig[key] = defaultConfig[key];
      }
    }

    ConfigProvider.saveConfig();
  }

  public get<T extends keyof ConfigValues>(key: T): ConfigValues[T] {
    if (!ConfigProvider.isLoaded) ConfigProvider.loadConfig();
    return this.getModuleConfig()[key];
  }

  public set<T extends keyof ConfigValues>(key: T, value: ConfigValues[T]): void {
    this.getModuleConfig()[key] = value;
    ConfigProvider.saveConfig();
  }

  private getModuleConfig(): ConfigValues {
    if (!ConfigProvider.config[this.moduleName]) {
      ConfigProvider.config[this.moduleName] = {};
    }

    return ConfigProvider.config[this.moduleName] as ConfigValues;
  }

  private static saveConfig(): void {
    if (!ConfigProvider.isLoaded) return;
    fs.writeFileSync(ConfigProvider.configPath, JSON.stringify(ConfigProvider.config, null, 2));
  }

  private static loadConfig(): void {
    if (ConfigProvider.isLoaded) return;
    if (!fs.existsSync(ConfigProvider.configPath)) fs.writeFileSync(ConfigProvider.configPath, "{}");

    ConfigProvider.config = JSON.parse(fs.readFileSync(ConfigProvider.configPath).toString());
    ConfigProvider.isLoaded = true;
    this.logger.info("Config loaded");
  }
}
