import { Client, Events } from "discord.js";

import { IntentOptions } from "./config/IntentOptions";
import { ExtendedClient } from "./interfaces/ExtendedClient";
import { errorHandler } from "./utils/errorHandler";
import { loadCommands } from "./utils/loadCommands";
import { logHandler } from "./utils/logHandler";
import { registerCommands } from "./utils/registerCommands";
import { validateEnv } from "./utils/validateEnv";

(async () => {
  const bot = new Client({ intents: IntentOptions }) as ExtendedClient;
  bot.env = validateEnv();
  await loadCommands(bot);

  bot.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply();
        const target = bot.commands.find(
          (c) => c.data.name === interaction.commandName
        );
        target
          ? await target.run(bot, interaction)
          : await interaction.editReply({
              content: `Command ${interaction.commandName} not found!`,
            });
      }
    } catch (err) {
      await errorHandler(bot, "interaction create", err);
    }
  });

  bot.on(Events.ClientReady, async () => {
    await registerCommands(bot);
    logHandler.info("Client ready!");
  });

  await bot.login(bot.env.token);
})();
