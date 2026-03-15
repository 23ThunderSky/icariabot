import {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
EmbedBuilder
} from "discord.js";

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

client.once("ready", () => {
console.log(`Bot online come ${client.user.tag}`);
});

client.on("messageCreate", async message => {

if (message.author.bot) return;

if (message.content === "!ping") {
message.reply("🏓 Pong!");
}

if (message.content === "!viaggio") {

const button = new ButtonBuilder()
.setCustomId("crea_viaggio")
.setLabel("Crea Viaggio")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(button);

message.channel.send({
content: "Premi per creare un viaggio",
components: [row]
});

}

});

client.on("interactionCreate", async interaction => {

if (interaction.isButton()) {

if (interaction.customId === "crea_viaggio") {

const modal = new ModalBuilder()
.setCustomId("modal_viaggio")
.setTitle("Crea nuovo viaggio");

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

const aziendaDest = new TextInputBuilder()
.setCustomId("azienda_destinazione")
.setLabel("Azienda di destinazione")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const carico = new TextInputBuilder()
.setCustomId("carico")
.setLabel("Carico")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

const rows = [
new ActionRowBuilder().addComponents(partenza),
new ActionRowBuilder().addComponents(aziendaPartenza),
new ActionRowBuilder().addComponents(destinazione),
new ActionRowBuilder().addComponents(aziendaDest),
new ActionRowBuilder().addComponents(carico)
];

modal.addComponents(...rows);

await interaction.showModal(modal);

}

}

if (interaction.isModalSubmit()) {

if (interaction.customId === "modal_viaggio") {

const partenza = interaction.fields.getTextInputValue("partenza");
const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
const destinazione = interaction.fields.getTextInputValue("destinazione");
const aziendaDest = interaction.fields.getTextInputValue("azienda_destinazione");
const carico = interaction.fields.getTextInputValue("carico");

const embed = new EmbedBuilder()

.setTitle("🚚 Documento di Trasporto")

.setColor("Red")

.addFields(

{
name: "👨‍✈️ Autista",
value: interaction.user.toString(),
inline: false
},

{
name: "📍 Partenza",
value: `${partenza}\n🏢 ${aziendaPartenza}`,
inline: true
},

{
name: "🏁 Destinazione",
value: `${destinazione}\n🏢 ${aziendaDest}`,
inline: true
},

{
name: "📦 Carico",
value: carico,
inline: false
},

{
name: "📊 Stato viaggio",
value: "🟥 In corso",
inline: false
}

)

.setTimestamp();

const consegna = new ButtonBuilder()
.setCustomId(`consegna_${interaction.user.id}`)
.setLabel("Segna consegna")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(consegna);

await interaction.reply({
embeds: [embed],
components: [row]
});

}

}

if (interaction.isButton()) {

if (interaction.customId.startsWith("consegna_")) {

const autista = interaction.customId.split("_")[1];

if (interaction.user.id !== autista) {

return interaction.reply({
content: "Solo l'autista può confermare la consegna.",
ephemeral: true
});

}

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Yellow");

embed.data.fields[4] = {
name: "📊 Stato viaggio",
value: "🟨 Consegnato - Magazzino da aggiornare",
inline: false
};

const aggiorna = new ButtonBuilder()
.setCustomId("magazzino_update")
.setLabel("Magazzino aggiornato")
.setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder().addComponents(aggiorna);

await interaction.update({
embeds: [embed],
components: [row]
});

}

if (interaction.customId === "magazzino_update") {

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Green");

embed.data.fields[4] = {
name: "📊 Stato viaggio",
value: "🟩 Documento registrato",
inline: false
};

await interaction.update({
embeds: [embed],
components: []
});

}

}

});

client.login(process.env.TOKEN);