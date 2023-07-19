import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import { time } from "../../../core/utils/time";
import { db } from "../../../core";
import { User } from "../../../../../database/entities/user.entity";

const Command = new SlashCommandBuilder()
  .setName("link")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription("Manually verify an account")
  .addStringOption((option) =>
    option.setName("phone").setDescription("The phone number to link").setRequired(true)
  )
  .addUserOption((option) => option.setName("user").setDescription("The user to link").setRequired(true))
  .setFunction(async (interaction) => {
    const phoneNumber = interaction.options.getString("phone");
    const user = interaction.options.getUser("user");

    if (!phoneNumber || !user) {
      await interaction.reply({
        content: "Invalid arguments",
        ephemeral: true,
      });
      return;
    }

    const userRepo = db.em.getRepository(User);

    const dbUser = await userRepo.findOne({ phoneNumber: parseInt(phoneNumber) });

    if (!dbUser) {
      await interaction.reply({
        content: "User not found",
        ephemeral: true,
      });
      return;
    }

    dbUser.discordId = user.id;
    await userRepo.persistAndFlush(dbUser);

    const member = await interaction.guild!.members.fetch(user.id);

    if (!member) {
      interaction.reply({
        content: "User not found in guild, please give role manually",
        ephemeral: true,
      });
      return;
    }

    const role = interaction.guild!.roles.cache.find((role) => role.name === "Verified");

    if (!role) {
      interaction.reply({
        content: "Verified role not found, please create it manually",
        ephemeral: true,
      });
      return;
    }

    await member.roles.add(role);

    await interaction.reply({
      content: `Linked ${phoneNumber} to ${user.username}`,
      ephemeral: true,
    });
  });

export default Command;
