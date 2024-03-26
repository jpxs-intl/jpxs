import chalk from "chalk";
export enum LogLevel {
  INFO,
  WARN,
  ERROR,
  DEBUG,
}


const GLOAL_LOG_SETTINGS: {
  consoleLogLevel: LogLevel;
  debugEnabled: boolean;
  colorEnabled: boolean;
  ignoreMethods: string[];
} = {
  // 0 : info, 1 : warn, 2 : error
  consoleLogLevel: LogLevel.INFO,
  debugEnabled: process.env.DEBUG === "true" || process.env.DEBUG_LOGS === "true",
  colorEnabled: true,
  ignoreMethods: []
};

export default class GlobalLogger {
  public static init(options?: {
    consoleLogLevel?: LogLevel;
    debugEnabled?: boolean;
    colorEnabled?: boolean;
    ignoreMethods?: string[];
  }) {
    GLOAL_LOG_SETTINGS.consoleLogLevel = options?.consoleLogLevel ?? GLOAL_LOG_SETTINGS.consoleLogLevel;
    GLOAL_LOG_SETTINGS.debugEnabled = options?.debugEnabled ?? GLOAL_LOG_SETTINGS.debugEnabled;
    GLOAL_LOG_SETTINGS.colorEnabled = options?.colorEnabled ?? GLOAL_LOG_SETTINGS.colorEnabled;
    GLOAL_LOG_SETTINGS.ignoreMethods = options?.ignoreMethods ?? GLOAL_LOG_SETTINGS.ignoreMethods;

    // announce that we're in debug mode
    if (GLOAL_LOG_SETTINGS.debugEnabled) {
      console.log(chalk.blue.bold("[DEBUG] ") + chalk.blue("Debug mode enabled"));
    }

    if (!GLOAL_LOG_SETTINGS.colorEnabled) {
      chalk.supportsColor = false;
    }
  }

  public static debug(method: string, ...message: any[]) {
    if (GLOAL_LOG_SETTINGS.debugEnabled && !GLOAL_LOG_SETTINGS.ignoreMethods.includes(method)) {
      const col = GlobalLogger.getColor(method);
      console.log(
        chalk.blue.bold(`[DEBUG]`) + chalk.hex(col).bold(`[${method}] `) + chalk.blue(`${message.join("\n")}`)
      );
    }
  }

  public static log(method: string, ...message: any[]) {
    const col = GlobalLogger.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel === 0 && !GLOAL_LOG_SETTINGS.ignoreMethods.includes(method))
      console.log(chalk.hex(col).bold(`[${method}] `) + chalk.green(`${message.join("\n")}`));
  }

  public static warn(method: string, ...message: any[]) {
    const col = GlobalLogger.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel <= 1 && !GLOAL_LOG_SETTINGS.ignoreMethods.includes(method))
      console.warn(chalk.hex(col).bold(`[${method}] `) + chalk.yellow(`${message.join("\n")}`));
  }

  public static error(method: string, ...message: any[]) {
    const col = GlobalLogger.getColor(method);
    if (GLOAL_LOG_SETTINGS.consoleLogLevel <= 2 && !GLOAL_LOG_SETTINGS.ignoreMethods.includes(method))
      console.error(chalk.hex(col).bold(`[${method}] `) + chalk.red(`${message.join("\n")}`));
  }

  public static info = (method: string, ...message: any[]) => GlobalLogger.log(method, ...message);

  public static getColor(str: string) {
    // calculate hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // convert to hex
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }
}

export class Logger {
  constructor(public readonly method: string) { }

  public debug(...message: any[]) {
    GlobalLogger.debug(this.method, ...message);
  }

  public log(...message: any[]) {
    GlobalLogger.log(this.method, ...message);
  }

  public warn(...message: any[]) {
    GlobalLogger.warn(this.method, ...message);
  }

  public error(...message: any[]) {
    GlobalLogger.error(this.method, ...message);
  }

  public info(...message: any[]) {
    GlobalLogger.info(this.method, ...message);
  }

  public static create(method: string) {
    return new Logger(method);
  }
}
