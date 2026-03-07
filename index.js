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

return;
}

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "menu_crea") {

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

if (interaction.values[0] === "treno") {

const embed = new EmbedBuilder()
.setTitle("🚂 Treno")
.setDescription("Lista merci del treno");

const aumenta = new ButtonBuilder()
.setCustomId("treno_arrivo")
.setLabel("Treno in arrivo")
.setStyle(ButtonStyle.Success)
.setEmoji("🚂");

const diminuisci = new ButtonBuilder()
.setCustomId("treno_ritiro")
.setLabel("Ritiro merce")
.setStyle(ButtonStyle.Danger)
.setEmoji("📦");

const modifica = new ButtonBuilder()
.setCustomId("modifica_treno")
.setLabel("Modifica rapida")
.setStyle(ButtonStyle.Primary)
.setEmoji("✏️");

const row = new ActionRowBuilder().addComponents(aumenta, diminuisci, modifica);

await interaction.update({
embeds: [embed],
components: [row]
});

}

}

if (interaction.customId === "menu_ritiro_merce") {

let merce = interaction.values[0];

const pannello = interaction.message || interaction.client.trenoPannello;

if (pannello && pannello.embeds.length > 0) {

const embed = pannello.embeds[0];
let testo = embed.description || "";

let righe = testo.split("\n");

righe = righe.map(riga => {

const rigaLower = riga.toLowerCase();

if (merce === "legna" && rigaLower.includes("legna")) {

let numero = parseInt(riga.split("|")[1]?.trim()) || 0;
numero = Math.max(numero - 1, 0);

return `🌲 Legna | ${numero}`;

}

if (merce === "grano" && rigaLower.includes("grano")) {

let numero = parseInt(riga.split("|")[1]?.trim()) || 0;
numero = Math.max(numero - 1, 0);

return `🌾 Grano | ${numero}`;

}

return riga;

});

const nuovoEmbed = EmbedBuilder.from(embed)
.setDescription(righe.join("\n"));

await pannello.edit({
embeds: [nuovoEmbed]
});

}

await interaction.reply({
content: "📦 Merce consegnata!",
ephemeral: true
});

}

if (interaction.customId === "menu_treno_merce") {

let merce = interaction.values[0];
let nome = merce === "legna" ? "🌲 Legna" : "🌾 Grano";

let tempo = 10;

const msg = await interaction.reply({
content: `🚂 Il treno con **${nome}** arriverà fra **${tempo} secondi**`,
fetchReply: true
});

const intervallo = setInterval(async () => {

tempo--;

if (tempo <= 0) {

const message = interaction.client.trenoPannello;

if (message && message.embeds.length > 0) {

const embed = message.embeds[0];
let testo = embed.description || "";

let righe = testo.split("\n");

righe = righe.map(riga => {

let rigaLower = riga.toLowerCase();

if (merce === "legna" && rigaLower.includes("legna")) {

let parti = riga.split("|");

let nome = parti[0].trim();
let numero = parseInt(parti[1]) || 0;

numero++;

return `${nome} | ${numero}`;

}

if (merce === "grano" && rigaLower.includes("grano")) {

let parti = riga.split("|");

let nome = parti[0].trim();
let numero = parseInt(parti[1]) || 0;

numero++;

return `${nome} | ${numero}`;

}

return riga;

});

const nuovoEmbed = EmbedBuilder.from(embed)
.setDescription(righe.join("\n"));

await message.edit({
embeds: [nuovoEmbed]
});

}

clearInterval(intervallo);

await msg.edit({
content: `🚂 Il treno con **${nome}** è arrivato con la merce!`
});

const pannello = interaction.message;

if (pannello && pannello.embeds.length > 0) {

const embed = pannello.embeds[0];
let testo = embed.description || "";

let righe = testo.split("\n");

righe = righe.map(riga => {

const rigaLower = riga.toLowerCase();

if (merce === "legna" && rigaLower.includes("legna")) {

const parti = riga.split("|");

const nome = parti[0].trim();
const numeroAttuale = parseInt(parti[1]?.trim()) || 0;

return `${nome} | ${numeroAttuale + 1}`;

}

if (merce === "grano" && rigaLower.includes("grano")) {

const parti = riga.split("|");

const nome = parti[0].trim();
const numeroAttuale = parseInt(parti[1]?.trim()) || 0;

return `${nome} | ${numeroAttuale + 1}`;

}

return riga;

});

const nuovoEmbed = EmbedBuilder.from(embed)
.setDescription(righe.join("\n"));

await pannello.edit({
embeds: [nuovoEmbed]
});

}

setTimeout(async () => {
try { await msg.delete(); } catch {}
}, 10000);

return;

}

await msg.edit({
content: `🚂 Il treno con **${nome}** arriverà fra **${tempo} secondi**`
});

}, 1000);

}

}

if (interaction.isButton()) {

if (interaction.customId === "treno_ritiro") {

let merce = interaction.values[0];

interaction.client.caricoSelezionato = merce;

const modal = new ModalBuilder()
.setCustomId("modal_ritiro")
.setTitle("📦 Dettagli consegna");

const partenza = new TextInputBuilder()
.setCustomId("partenza")
.setLabel("Partenza")
.setStyle(TextInputStyle.Short);

const aziendaPartenza = new TextInputBuilder()
.setCustomId("azienda_partenza")
.setLabel("Azienda di partenza")
.setStyle(TextInputStyle.Short);

const destinazione = new TextInputBuilder()
.setCustomId("destinazione")
.setLabel("Destinazione")
.setStyle(TextInputStyle.Short);

const aziendaDestinazione = new TextInputBuilder()
.setCustomId("azienda_destinazione")
.setLabel("Azienda di destinazione")
.setStyle(TextInputStyle.Short);

const row1 = new ActionRowBuilder().addComponents(partenza);
const row2 = new ActionRowBuilder().addComponents(aziendaPartenza);
const row3 = new ActionRowBuilder().addComponents(destinazione);
const row4 = new ActionRowBuilder().addComponents(aziendaDestinazione);

modal.addComponents(row1, row2, row3, row4);

await interaction.showModal(modal);
}

if (interaction.customId === "treno_arrivo") {

const pannello = interaction.message;

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_treno_merce")
.setPlaceholder("Seleziona la merce")
.addOptions([
{ label: "Legna", value: "legna", emoji: "🌲" },
{ label: "Grano", value: "grano", emoji: "🌾" }
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "🚂 Seleziona la merce in arrivo:",
components: [row],
ephemeral: true
});

interaction.client.trenoPannello = pannello;

}

if (interaction.customId === "modifica_treno") {

const embed = interaction.message.embeds[0]?.toJSON() || {};

const titoloAttuale = embed.title || "";
const contenutoAttuale = embed.description || "";

const modal = new ModalBuilder()
.setCustomId("modal_treno")
.setTitle("Modifica Treno");

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

if (interaction.customId === "modal_ritiro") {

const partenza = interaction.fields.getTextInputValue("partenza");
const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
const destinazione = interaction.fields.getTextInputValue("destinazione");
const aziendaDestinazione = interaction.fields.getTextInputValue("azienda_destinazione");

const merce = interaction.client.caricoSelezionato;

let nomeCarico = merce === "legna" ? "🌲 Legna" : "🌾 Grano";

const canale = await client.channels.fetch("1478813516835328042");

await canale.send({
content:
`🚚 **Nuova consegna**

📍 **Partenza:** ${partenza}
🏢 **Azienda di partenza:** ${aziendaPartenza}

📍 **Destinazione:** ${destinazione}
🏢 **Azienda di destinazione:** ${aziendaDestinazione}

📦 **Carico:** ${nomeCarico}`
});

await interaction.reply({
content: "✅ Consegna registrata!",
ephemeral: true
});

}

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

if (interaction.customId === "modal_treno") {

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

const aumenta = new ButtonBuilder()
.setCustomId("treno_arrivo")
.setLabel("Treno in arrivo")
.setStyle(ButtonStyle.Success)
.setEmoji("🚂");

const diminuisci = new ButtonBuilder()
.setCustomId("treno_ritiro")
.setLabel("Ritiro merce")
.setStyle(ButtonStyle.Danger)
.setEmoji("📦");

const modifica = new ButtonBuilder()
.setCustomId("modifica_treno")
.setLabel("Modifica rapida")
.setStyle(ButtonStyle.Primary)
.setEmoji("✏️");

const row = new ActionRowBuilder().addComponents(aumenta, diminuisci, modifica);

await interaction.update({
embeds: [embed],
components: [row]
});

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const CANALE_RITIRO = "1478813516835328042";

client.on("interactionCreate", async (interaction) => {

    // MENU LEGNA / GRANO
    if (interaction.isStringSelectMenu() && interaction.customId === "menu_ritiro") {

        const carico = interaction.values[0];

        const modal = new ModalBuilder()
        .setCustomId(`ritiro_${carico}`)
        .setTitle("Dati Ritiro Merci");

        const partenza = new TextInputBuilder()
        .setCustomId("partenza")
        .setLabel("Partenza")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const aziendaPartenza = new TextInputBuilder()
        .setCustomId("azienda_partenza")
        .setLabel("Azienda di partenza")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const destinazione = new TextInputBuilder()
        .setCustomId("destinazione")
        .setLabel("Destinazione")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const aziendaDestinazione = new TextInputBuilder()
        .setCustomId("azienda_destinazione")
        .setLabel("Azienda di destinazione")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(partenza),
            new ActionRowBuilder().addComponents(aziendaPartenza),
            new ActionRowBuilder().addComponents(destinazione),
            new ActionRowBuilder().addComponents(aziendaDestinazione)
        );

        await interaction.showModal(modal);
    }

    // INVIO MESSAGGIO NEL CANALE
    if (interaction.isModalSubmit() && interaction.customId.startsWith("ritiro_")) {

        const carico = interaction.customId.split("_")[1];

        const partenza = interaction.fields.getTextInputValue("partenza");
        const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
        const destinazione = interaction.fields.getTextInputValue("destinazione");
        const aziendaDestinazione = interaction.fields.getTextInputValue("azienda_destinazione");

        const canale = interaction.client.channels.cache.get(CANALE_RITIRO);

        const messaggio = `
🚚 **Nuovo Ritiro Merci**

📍 **Partenza:** ${partenza}
🏢 **Azienda di partenza:** ${aziendaPartenza}

📍 **Destinazione:** ${destinazione}
🏢 **Azienda di destinazione:** ${aziendaDestinazione}

📦 **Carico:** ${carico}
`;

        canale.send(messaggio);

        await interaction.reply({
            content: "✅ Ritiro merci inviato!",
            ephemeral: true
        });
    }

});

}

}

});

client.login(process.env.TOKEN);