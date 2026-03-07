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
ModalBuilder,
TextInputBuilder,
TextInputStyle,
EmbedBuilder,
Events
} = require("discord.js");

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

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "crea") {

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_crea")
.setPlaceholder("Scegli cosa creare")
.addOptions([
{ label: "Magazzino", value: "magazzino", emoji: "📦" },
{ label: "Treno", value: "treno", emoji: "🚂" },
{ label: "Viaggio", value: "viaggio", emoji: "🚚" }
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "Seleziona cosa creare:",
components: [row]
});

}

}

if (interaction.isStringSelectMenu()) {

if (interaction.values[0] === "magazzino") {

const embed = new EmbedBuilder()
.setTitle("📦 Magazzino")
.setDescription("Contenuto del magazzino");

const button = new ButtonBuilder()
.setCustomId("modifica_magazzino")
.setLabel("Modifica rapida")
.setStyle(ButtonStyle.Primary)
.setEmoji("✏️");

const row = new ActionRowBuilder().addComponents(button);

await interaction.update({
embeds: [embed],
components: [row]
});

}

}

if (interaction.isButton()) {

if (interaction.customId === "modifica_magazzino") {

const embed = interaction.message.embeds[0] || {};

const titoloAttuale = embed.data?.title ?? embed.title ?? "";
const contenutoAttuale = embed.data?.description ?? embed.description ?? "";

const modal = new ModalBuilder()
.setCustomId("modal_magazzino")
.setTitle("Modifica Magazzino");

const titolo = new TextInputBuilder()
.setCustomId("titolo")
.setLabel("Titolo")
.setStyle(TextInputStyle.Short)
.setValue(titoloAttuale);

const contenuto = new TextInputBuilder()
.setCustomId("contenuto")
.setLabel("Contenuto")
.setStyle(TextInputStyle.Paragraph)
.setValue(contenutoAttuale);

const row1 = new ActionRowBuilder().addComponents(titolo);
const row2 = new ActionRowBuilder().addComponents(contenuto);

modal.addComponents(row1, row2);

await interaction.showModal(modal);

}

}

if (interaction.isModalSubmit()) {

if (interaction.customId === "modal_magazzino") {

const titolo = interaction.fields.getTextInputValue("titolo");
let contenuto = interaction.fields.getTextInputValue("contenuto");

contenuto = contenuto
.split("\n")
.map(riga => {
if (riga.includes("|")) return riga;
return `${riga} | 0`;
})
.join("\n");

const embed = new EmbedBuilder()
.setTitle(titolo)
.setDescription(contenuto);

const button = new ButtonBuilder()
.setCustomId("modifica_magazzino")
.setLabel("Modifica rapida")
.setStyle(ButtonStyle.Primary)
.setEmoji("✏️");

const row = new ActionRowBuilder().addComponents(button);

await interaction.update({
embeds: [embed],
components: [row]
});

}

}

});

client.login(process.env.TOKEN);