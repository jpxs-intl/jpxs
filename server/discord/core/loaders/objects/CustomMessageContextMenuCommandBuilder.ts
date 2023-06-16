import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  LocaleString,
  LocalizationMap,
} from "discord.js";
import CommandBuilder from "./customSlashCommandBuilder";

export default class CustomMessageContextMenuCommandBuilder {
  protected enabled: boolean = true;
  private _builder = new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message);
  private _module = "";
  execute: (interaction: ContextMenuCommandInteraction) => Promise<void> = async () => Promise.resolve();

  constructor() {}

  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  setFunction(callback: (interaction: ContextMenuCommandInteraction) => Promise<void>): this {
    this.execute = callback;
    return this;
  }

  setName(name: string) {
    this._builder.setName(name);
    return this;
  }

  setNameLocalization(locale: LocaleString, localizedName: string | null) {
    this._builder.setNameLocalization(locale, localizedName);
    return this;
  }

  setNameLocalizations(localizedNames: LocalizationMap | null) {
    this._builder.setNameLocalizations(localizedNames);
    return this;
  }

  toConextMenuCommandBuilder(): ContextMenuCommandBuilder {
    return this._builder;
  }

  getName(): string {
    return this._builder.name;
  }

  getType(): "MESSAGE" {
    return "MESSAGE";
  }

  setModule(module: string) {
    this._module = module;
  }

  getModule(): string {
    return this._module;
  }

  isChatInputCommandHandler(): this is CommandBuilder {
    return true;
  }

  run(interaction: ContextMenuCommandInteraction): Promise<void> {
    if (interaction.commandType == ApplicationCommandType.Message) {
      this.execute(interaction);
    }
    return Promise.resolve();
  }
}
