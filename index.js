const {
Client,
GatewayIntentBits,
REST,
Routes,
SlashCommandBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
Events
} = require("discord.js");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const commands = [
new SlashCommandBuilder()
.setName("crea")
.setDescription("Crea il pannello del treno")
].map(c => c.toJSON());

client.once("clientReady", async () => {

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

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "crea") {

const embed = new EmbedBuilder()
.setTitle("🚂 Gestione Treno")
.setDescription("Legna | 0\nGrano | 0");

const arrivo = new ButtonBuilder()
.setCustomId("treno_arrivo")
.setLabel("Treno in arrivo")
.setStyle(ButtonStyle.Success)
.setEmoji("🚂");

const ritiro = new ButtonBuilder()
.setCustomId("treno_ritiro")
.setLabel("Ritiro merce")
.setStyle(ButtonStyle.Danger)
.setEmoji("📦");

const modifica = new ButtonBuilder()
.setCustomId("modifica_treno")
.setLabel("Modifica rapida")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(arrivo, ritiro, modifica);

await interaction.reply({
embeds: [embed],
components: [row]
});

}

}

if (interaction.isButton()) {

if (interaction.customId === "treno_arrivo") {

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_treno")
.setPlaceholder("Seleziona merce")
.addOptions([
{
label: "Legna",
value: "Legna",
emoji: "🪵"
},
{
label: "Grano",
value: "Grano",
emoji: "🌾"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "🚂 Seleziona la merce che arriverà con il treno",
components: [row],
ephemeral: true
});

}

}

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "menu_treno") {

const prodotto = interaction.values[0];

await interaction.reply({
content: `🚂 Il treno arriverà con **${prodotto}**`,
ephemeral: true
});

}

}

});

client.login(process.env.TOKEN);