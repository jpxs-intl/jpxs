import Bot from "../bot.ts";
import CustomMessageContextMenuCommandBuilder from "./objects/CustomMessageContextMenuCommandBuilder.ts";
import CustomUserContextMenuCommandBuilder from "./objects/CustomUserContextMenuCommandBuilder.ts";
import CustomSlashCommandBuilder from "./objects/customSlashCommandBuilder.ts";
import { GatewayIntentsString } from "discord.js";

export class BaseModuleType {
    constructor(bot: Bot) { }
}

export class Module {
    name: string;
    description: string;
    onLoad: () => promise<void>;
    onUnload: () => promise<void>;
}

export type CustomCommandBuilder = CustomSlashCommandBuilder | CustomUserContextMenuCommandBuilder | CustomMessageContextMenuCommandBuilder

export interface Manifest {
    name: string;
    description: string;
    version: string;
    intents: GatewayIntentsString[];
}