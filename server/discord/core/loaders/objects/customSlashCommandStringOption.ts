import {
  APIApplicationCommandOptionChoice,
  AutocompleteInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandStringOption,
} from "discord.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption";

export default class CustomSlashCommandStringOption {
  private _builder: SlashCommandStringOption = new SlashCommandStringOption();

  autocompleteCallback?: (
    interaction: AutocompleteInteraction,
    text: string
  ) => Promise<
    {
      name: string;
      value: string;
    }[]
  >;

  constructor() {}

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

  setRequired(required: boolean) {
    this._builder.setRequired(required);
    return this;
  }

  setMinLength(minLength: number) {
    this._builder.setMinLength(minLength);
    return this;
  }

  setMaxLength(maxLength: number) {
    this._builder.setMaxLength(maxLength);
    return this;
  }

  setChoices(...choices: APIApplicationCommandOptionChoice<string>[]) {
    this._builder.setChoices(...choices);
    return this;
  }

  addChoices(...choices: APIApplicationCommandOptionChoice<string>[]) {
    this._builder.addChoices(...choices);
    return this;
  }

  setAutocomplete(
    callback: (
      interaction: AutocompleteInteraction,
      text: string
    ) => Promise<
      {
        name: string;
        value: string;
      }[]
    >
  ): this {
    this.autocompleteCallback = callback;
    this._builder.setAutocomplete(true);
    return this;
  }

  get builder(): SlashCommandStringOption {
    return this._builder;
  }

  get name(): string {
    return this._builder.name;
  }

  get type() {
    return "string";
  }

  takesStringTypeOption(): this is CustomSlashCommandStringOption {
    return true;
  }

  takesNumberTypeOption(): this is CustomSlashCommandNumberOption | CustomSlashCommandIntegerOption {
    return false;
  }

  isCustomOption(): this is
    | CustomSlashCommandNumberOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandStringOption {
    return true;
  }
}
