import { config as intEnv } from "dotenv";
intEnv();
import Database from "./database";
import ServerGrabber from "./server/data/serverGrabber";
import "./server/web";
import KeyManager from "./server/database/keyManager";
import Logger from "./utils/logger";
import discord from "./server/discord/core";

export const DEVELOPMENT = process.env.NODE_ENV === "development" || process.env.DEVELOPMENT === "true";

Logger.info("System", `Starting in ${DEVELOPMENT ? "development" : "production"} mode`);
if (DEVELOPMENT)
  Logger.warn("System", "Development mode is enabled, Data grabbed will not be contributed to the database.");

export const db = new Database(async () => {
  await KeyManager.instance.loadKeys();
});

export const bot = discord.bot;

export const serverGrabber = new ServerGrabber({
  contribute: !DEVELOPMENT,
});
