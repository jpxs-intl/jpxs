import { Client, Colors, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

export default class ModalManager {
  public modals: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (modal) => {
      if (!modal.isModalSubmit()) return;

      const modalId = modal.customId;
      const modalFunc = this.modals.get(modalId);
      if (!modalFunc) {
        modal.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(`This Modal has expired.`)
              .setColor(Colors.Red)
              .setFooter({ text: `modalId: ${modal.customId}` }),
          ],
          ephemeral: true,
        });
        return;
      }
      modalFunc(modal);
    });
  }

  public registerModal(id: string, callback: (interaction: ModalSubmitInteraction) => Promise<any>) {
    this.modals.set(id, callback);
  }

  public unregisterModal(id: string) {
    this.modals.delete(id);
  }
}
