import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const secure: Command = {
  data: new SlashCommandBuilder()
    .setName("secure")
    .setDescription("Pauses invites and DMs for the next 24 hours.")
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName("invites")
        .setDescription("Whether to pause invites or not.")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("dms")
        .setDescription("Whether to pause DMs or not.")
        .setRequired(true)
    ),
  run: async (bot, interaction) => {
    try {
      const { guild, member } = interaction;
      const pauseInvites = interaction.options.getBoolean("invites", true);
      const pauseDms = interaction.options.getBoolean("dms", true);

      if (!guild || !member || !(member instanceof GuildMember)) {
        await interaction.editReply({
          content: "This must be run in a server.",
        });
        return;
      }

      if (
        ![
          PermissionFlagsBits.Administrator,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageGuild,
        ].some((perm) => member.permissions.has(perm))
      ) {
        await interaction.editReply({
          content: "You do not have permission to use this command.",
        });
        return;
      }

      const botMember = await guild.members
        .fetch(bot.user?.id || "oopsie")
        .catch(() => null);

      if (
        !botMember ||
        ![
          PermissionFlagsBits.Administrator,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageGuild,
        ].some((perm) => botMember.permissions.has(perm))
      ) {
        await interaction.editReply({
          content: "I do not have the correct permissions to do this.",
        });
        return;
      }

      const date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const req = await fetch(
        `https://discord.com/api/v10/guilds/${guild.id}/incident-actions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${bot.env.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            dms_disabled_until: pauseDms ? date : null,
            invites_disabled_until: pauseInvites ? date : null,
          }),
        }
      );
      const res = await req.json();

      if (req.status !== 200) {
        await interaction.editReply({
          content:
            "Failed to update security settings. Please [contact Naomi](<https://chat.naomi.lgbt>) if the issue persists.",
        });
        await bot.env.debugHook.send({
          content: `Failed to update security actions for ${
            guild.id
          }:\n\`\`\`${JSON.stringify(res, null, 2)}`,
        });
        return;
      }

      await interaction.editReply({
        content: `Security options have been updated.\nInvites are ${
          pauseInvites ? "disabled for the next 24 hours" : "enabled"
        }.\nDMs are ${pauseDms ? "disabled for the next 24 hours" : "enabled"}`,
      });
    } catch (err) {
      await errorHandler(bot, "invites command", err);
      await interaction.editReply({
        content:
          "Something went wrong. [Need help?](<https://chat.naomi.lgbt>)",
      });
    }
  },
};
