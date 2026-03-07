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
.setDescription("Crea pannello")
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

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_crea")
.setPlaceholder("Seleziona")
.addOptions([
{ label: "Magazzino", value: "magazzino", emoji: "📦" },
{ label: "Treno", value: "treno", emoji: "🚂" }
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "Seleziona cosa creare",
components: [row]
});

}

}

if (interaction.isStringSelectMenu()) {

if (interaction.values[0] === "treno") {

const embed = new EmbedBuilder()
.setTitle("🚂 Treno")
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

await interaction.update({
embeds: [embed],
components: [row]
});

}

if (interaction.customId === "menu_treno") {

const prodotto = interaction.values[0];

let tempo = 10;

const countdownMsg = await interaction.reply({
content: `🚂 Il treno arriverà con **${prodotto}** tra **${tempo}** secondi...`,
fetchReply: true
});

const intervallo = setInterval(async () => {

tempo--;

if (tempo > 0) {

await countdownMsg.edit({
content: `🚂 Il treno arriverà con **${prodotto}** tra **${tempo}** secondi...`
});

} else {

clearInterval(intervallo);

await countdownMsg.edit({
content: `🚂 Il treno è arrivato con **${prodotto}**!`
});

const message = interaction.message;

let embed = message.embeds?.[0];
if (!embed) return;

let testo = embed.description || "";
let righe = testo.split("\n");

righe = righe.map(riga => {

if (riga.toLowerCase().startsWith(prodotto.toLowerCase())) {

let numero = parseInt(riga.split("|")[1]) || 0;
numero++;

return `${prodotto} | ${numero}`;

}

return riga;

});

const nuovoEmbed = EmbedBuilder.from(embed)
.setDescription(righe.join("\n"));

await message.edit({
embeds: [nuovoEmbed]
});

setTimeout(() => {
countdownMsg.delete().catch(() => {});
}, 10000);

}

}, 1000);

}

}

if (interaction.isButton()) {

if (interaction.customId === "treno_arrivo") {

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_treno")
.setPlaceholder("Seleziona merce")
.addOptions([
{ label: "Legna", value: "Legna", emoji: "🪵" },
{ label: "Grano", value: "Grano", emoji: "🌾" }
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "Che merce arriverà?",
components: [row],
ephemeral: true
});

}

}

});

client.login(process.env.TOKEN);