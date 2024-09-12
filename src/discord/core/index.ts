import CoreObject from './core.js';
import GlobalLogger, { LogLevel } from "../../utils/logger.js";

GlobalLogger.init({
    consoleLogLevel: LogLevel.INFO,
    debugEnabled: true
})

console.log(process.env)

var Core = new CoreObject({
    token: process.env.BOT_TOKEN as string,
    mode: 'selfhost',
})

let bot = Core.bot;
let client = Core.Client;
let db = Core.db;

export default Core;
export { bot, client, db };