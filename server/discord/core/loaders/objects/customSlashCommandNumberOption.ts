import {
  APIApplicationCommandOptionChoice,
  AutocompleteInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandNumberOption,
} from "discord.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption";

export default class CustomSlashCommandNumberOption {
  private _builder: SlashCommandNumberOption = new SlashCommandNumberOption();

  autocompleteCallback?: (
    interaction: AutocompleteInteraction,
    text: number
  ) => Promise<
    {
      name: string;
      value: number;
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

  setMinValue(minValue: number) {
    this._builder.setMinValue(minValue);
    return this;
  }

  setMaxValue(maxValue: number) {
    this._builder.setMaxValue(maxValue);
    return this;
  }

  setChoices(...choices: APIApplicationCommandOptionChoice<number>[]) {
    this._builder.setChoices(...choices);
    return this;
  }

  addChoices(...choices: APIApplicationCommandOptionChoice<number>[]) {
    this._builder.addChoices(...choices);
    return this;
  }

  setAutoComplete(
    callback: (
      interaction: AutocompleteInteraction,
      text: number
    ) => Promise<
      {
        name: string;
        value: number;
      }[]
    >
  ): this {
    this.autocompleteCallback = callback;
    this._builder.setAutocomplete(true);
    return this;
  }

  get builder(): SlashCommandNumberOption {
    return this._builder;
  }

  get name(): string {
    return this._builder.name;
  }

  get type() {
    return "number";
  }

  takesStringTypeOption(): this is CustomSlashCommandStringOption {
    return false;
  }

  takesNumberTypeOption(): this is CustomSlashCommandNumberOption | CustomSlashCommandIntegerOption {
    return true;
  }

  isCustomOption(): this is
    | CustomSlashCommandNumberOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandStringOption {
    return true;
  }
}
