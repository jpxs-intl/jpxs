import { bot } from "../../core";
import Module from "../../core/base/module";
import RolePicker from "./rolePicker";
import Logger from "../../core/utils/logger";
import { GuildMember, GuildMemberRoleManager, StringSelectMenuInteraction } from "discord.js";

export default class RolesModule extends Module {
  name = "roles";
  description = "manages roles";

  getRolesModule(): RolesModule {
    return bot.moduleLoader.getModule("roles") as RolesModule;
  }

  override async onLoad(): Promise<boolean> {
    const picker = new RolePicker([
      {
        id: "1090404665281220818",
        name: "Announcements",
        description: "Get notified when big things happen",
      },
      {
        id: "1090398520802037793",
        name: "Git",
        description: "Get access to the git feeds, with updates and changes",
      },
      {
        id: "1094709753596358858",
        name: "Featured",
        description: "See featured non-jpxs related projects",
      },
      {
        id: "1090404440021934080",
        name: "Updates: JPXS",
        description: "Get notified about updates to JPXS",
      },
      {
        id: "1090404519814377642",
        name: "Updates: Map Editor",
        description: "Get notified about updates to the Map Editor",
      },
      {
        id: "1090404566031401070",
        name: "Updates: RosaLink",
        description: "Get notified about updates to RosaLink",
      },
      {
        id: "1090404605001236480",
        name: "Updates: Misc",
        description: "Get notified about updates to other JPXS related projects",
      },

      {
        id: "1116034715074437209",
        name: "Playing: JPXS://world",
        description: "Get notified when people are playing JPXS://world",
      },
      {
        id: "1114397846586789898",
        name: "Playing: JPXS://modded.versus",
        description: "Get notified when people are playing JPXS://modded.versus",
      },
      {
        id: "1111515329034719322",
        name: "Playing: JPXS://round",
        description: "Get notified when people are playinqg JPXS://round",
      },
      {
        id: "1111515508026646528",
        name: "Playing: Rosa Fortress 2",
        description: "Get notified when people are playing Rosa Fortress 2",
      },
    ]);

    bot.buttonManager.registerButton("role-menu", async (interaction) => {
      picker.createPickerMenu(interaction);
    });

    bot.selectMenuManager.registerMenu(
      "role-picker",
      async (menuInteraction: StringSelectMenuInteraction) => {
        const selected = menuInteraction.values;
        const member = menuInteraction.member;
        if (!member) return;
        const roles = member.roles;
        if (!roles || !(roles instanceof GuildMemberRoleManager)) return;

        const promises: Promise<GuildMember>[] = [];

        picker.roles.forEach(async (role) => {
          if (selected.includes(role.id)) {
            if (!roles.cache.has(role.id)) {
              promises.push(roles.add(role.id));
            }
          } else {
            if (roles.cache.has(role.id)) {
              promises.push(roles.remove(role.id));
            }
          }
        });

        await menuInteraction.update({
          content: "Updating roles...",
        });

        await Promise.all(promises).catch((err) => Logger.error("rolePicker", err));

        await menuInteraction
          .editReply({
            content: "Roles updated!",
            components: [picker.createMenu(menuInteraction, true)],
          })
          .catch((err) => Logger.error("rolePicker", err))
          .then(() => {
            setTimeout(async () => {
              await menuInteraction.deleteReply().catch((err) => Logger.error("rolePicker", err));
            }, 10000);
          });
      }
    );

    bot.client.on("guildMemberAdd", async (member) => {
      member.roles.add("1090409280194216067");
    });

    return true;
  }
}
