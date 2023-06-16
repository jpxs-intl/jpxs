import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption";
import CustomSlashCommandSubcommandBuilder from "./customSlashCommandSubcommandBuilder";

export default class CustomSlashCommandSubcommandGroupBuilder {
  protected enabled: boolean = true;
  private _builder = new SlashCommandSubcommandGroupBuilder();
  private _customOptions: CustomSlashCommandSubcommandBuilder[] = [];

  constructor() {}

  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
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

  setDescription(description: string) {
    this._builder.setDescription(description);
    return this;
  }
  setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null) {
    this._builder.setDescriptionLocalization(locale, localizedDescription);
    return this;
  }

  setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null) {
    this._builder.setDescriptionLocalizations(localizedDescriptions);
    return this;
  }

  addSubcommand(
    callback: (option: CustomSlashCommandSubcommandBuilder) => CustomSlashCommandSubcommandBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandBuilder();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommand(res.builder);
    return this;
  }

  get builder(): SlashCommandSubcommandGroupBuilder {
    return this._builder;
  }

  get name(): string {
    return this._builder.name;
  }

  isCustomOption(): this is
    | CustomSlashCommandNumberOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandStringOption {
    return false;
  }

  run(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (!subcommand) {
      return Promise.resolve();
    }

    const subCommandBuilder = this._customOptions.find((x) => x.name === subcommand);
    if (!subCommandBuilder) {
      return Promise.resolve();
    }

    return subCommandBuilder.run(interaction);
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const subcommand = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.Subcommand
    )
      ? interaction.options.getSubcommand()
      : null;
    if (!subcommand) {
      return;
    }

    const subCommandBuilder = this._customOptions.find((x) => x.name === subcommand);
    if (!subCommandBuilder) {
      return;
    }

    subCommandBuilder.handleAutocomplete(interaction);
  }
}
