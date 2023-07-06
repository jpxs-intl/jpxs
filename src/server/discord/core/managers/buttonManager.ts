
import { ButtonInteraction, Client, Collection, Colors, EmbedBuilder } from "discord.js";

interface Button {
  data: {
    customId: string;
  };
  execute: (Interaction: ButtonInteraction) => Promise<void>;
}

export default class ButtonManager {
  public client: Client;
  public buttons: Collection<string, Button> = new Collection();

  constructor(client: Client) {
    this.client = client;

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return; 
      if (interaction.replied) return; 

      const command = this.buttons.get(interaction.customId);

      if (!command) {
        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(`This button has expired.`)
              .setColor(Colors.Red)
              .setFooter({ text: `buttonId: ${interaction.customId}` }),
          ],
        });
        return;
      }
      command.execute(interaction);
    });
  }

  public registerButton(id: string, callback: (interaction: ButtonInteraction) => Promise<any>) {
    const buttonCommand: Button = {
      data: {
        customId: id,
      },

      execute: async (interaction: ButtonInteraction) => {
        callback(interaction);
      },
    };

    this.buttons.set(id, buttonCommand);
  }

  public unregisterButton(id: string) {
    this.buttons.delete(id);
  }
}
