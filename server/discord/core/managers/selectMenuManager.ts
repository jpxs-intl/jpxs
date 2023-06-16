import { Client, Colors, EmbedBuilder, InteractionType, StringSelectMenuInteraction } from "discord.js";
import Logger from "../utils/logger";

export default class SelectMenuManager {
  public menus: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (menu) => {
      if (!menu.isStringSelectMenu()) return;

      const menuId = menu.customId;
      const menuFunc = this.menus.get(menuId);
      if (!menuFunc) {
        menu.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(`This menu has expired.`)
              .setColor(Colors.Red)
              .setFooter({ text: `menuId: ${menu.customId}` }),
          ],
        }).catch(err => Logger.error(menu.customId , err));
        return;
      }
      menuFunc(menu);
    });
  }

  public registerMenu(id: string, callback: (interaction: StringSelectMenuInteraction) => any) {
    this.menus.set(id, callback);
    Logger.debug("SelectMenuManager", `Registered menu ${id}`);
  }

  public unregisterMenu(id: string) {
    this.menus.delete(id);
  }
}