const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, Events } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("crea")
    .setDescription("Crea qualcosa")
].map(c => c.toJSON());

client.once("ready", async () => {

  console.log("Bot online");

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Comandi registrati");

});

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "crea") {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu")
      .setPlaceholder("Scegli cosa creare")
      .addOptions([
        { label: "Magazzino", value: "magazzino" },
        { label: "Treno", value: "treno" },
        { label: "Viaggio", value: "viaggio" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "Scegli:",
      components: [row]
    });

  }

});

client.login(process.env.TOKEN);