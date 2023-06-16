import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

interface RoleType {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
}

export default class RolePicker {
  public roles: RoleType[];

  constructor(roles: RoleType[]) {
    this.roles = roles;
  }

  public createPickerMenu(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    interaction.reply({
      content: "Select your roles",
      components: [this.createMenu(interaction)],
      ephemeral: true,
    });
  }

  public createMenu(
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
    disabled = false
  ) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("role-picker")
      .setMaxValues(this.roles.length)
      .setMinValues(0)
      .setDisabled(disabled)
      .setOptions(
        this.roles.map((role) => {
          return {
            label: role.name,
            value: role.id,
            emoji: role.emoji || undefined,
            description: role.description || undefined,
          };
        })
      );

    const roles = interaction.member?.roles;

    if (roles && roles instanceof GuildMemberRoleManager) {
      menu.options.map((option) => {
        if (roles.cache.has(option.data.value as string)) {
          option.setDefault(true);
        }
      });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    return row;
  }
}
