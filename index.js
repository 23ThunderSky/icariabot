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

let ultimoMessaggioCreaViaggio = null;

/* ---------------- MAGAZZINO ---------------- */

let magazzino = {};
let titoloMagazzino = "📦 MAGAZZINO";
let descrizioneMagazzino = "";
let messaggioMagazzino = null;

/* ---------------- READY ---------------- */

client.once("ready", () => {
console.log(`Bot online come ${client.user.tag}`);
});

/* ---------------- PULSANTE VIAGGIO ---------------- */

async function inviaPulsanteViaggio(channel){

if(ultimoMessaggioCreaViaggio){

try{
const msg = await channel.messages.fetch(ultimoMessaggioCreaViaggio);
await msg.delete();
}catch{}

}

const button = new ButtonBuilder()
.setCustomId("crea_viaggio")
.setLabel("Crea Viaggio")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(button);

const msg = await channel.send({
content:"🚚 **Sistema Creazione Viaggi**",
components:[row]
});

ultimoMessaggioCreaViaggio = msg.id;

}

/* ---------------- EMBED MAGAZZINO ---------------- */

function generaEmbedMagazzino(){

const embed = new EmbedBuilder()
.setTitle(titoloMagazzino)
.setDescription(descrizioneMagazzino)
.setColor("Blue")
.setTimestamp();

for(const prodotto in magazzino){

embed.addFields({
name: prodotto,
value:`${magazzino[prodotto].count} / ${magazzino[prodotto].max}`,
inline:true
});

}

return embed;

}

/* ---------------- BOTTONI MAGAZZINO ---------------- */

function generaBottoniMagazzino(){

const rows = [];

for(const prodotto in magazzino){

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId(`meno_${prodotto}`)
.setLabel(`➖ ${prodotto}`)
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId(`piu_${prodotto}`)
.setLabel(`➕ ${prodotto}`)
.setStyle(ButtonStyle.Secondary)

);

rows.push(row);

}

const modifica = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("modifica_magazzino")
.setLabel("✏️ Modifica Magazzino")
.setStyle(ButtonStyle.Primary)

);

rows.push(modifica);

return rows;

}

/* ---------------- MESSAGE CREATE ---------------- */

client.on("messageCreate", async message => {

if (message.author.bot) return;

if (message.content === "!ping") {
message.reply("🏓 Pong!");
}

if (message.content === "!viaggio") {
await inviaPulsanteViaggio(message.channel);
}

/* ----------- MAGAZZINO ----------- */

if (message.content === "!magazzino") {

const modal = new ModalBuilder()
.setCustomId("crea_magazzino")
.setTitle("Crea Magazzino");

const prodotti = new TextInputBuilder()
.setCustomId("prodotti")
.setLabel("Prodotti (es: Latte:10)")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(prodotti)
);

await message.reply({
content:"Apri il modal per creare il magazzino",
components:[
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("apri_modal_magazzino")
.setLabel("Apri")
.setStyle(ButtonStyle.Primary)
)
]
});

client.once("interactionCreate", async i => {

if(i.customId === "apri_modal_magazzino"){
await i.showModal(modal);
}

});

}

});

/* ---------------- INTERACTION ---------------- */

client.on("interactionCreate", async interaction => {

if (interaction.isButton()) {

/* ----------- CREA VIAGGIO ----------- */

if (interaction.customId === "crea_viaggio") {

const modal = new ModalBuilder()
.setCustomId("modal_viaggio")
.setTitle("Crea nuovo viaggio");

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

const aziendaDest = new TextInputBuilder()
.setCustomId("azienda_destinazione")
.setLabel("Azienda destinazione")
.setStyle(TextInputStyle.Short);

const carico = new TextInputBuilder()
.setCustomId("carico")
.setLabel("Carico")
.setStyle(TextInputStyle.Paragraph);

modal.addComponents(
new ActionRowBuilder().addComponents(partenza),
new ActionRowBuilder().addComponents(aziendaPartenza),
new ActionRowBuilder().addComponents(destinazione),
new ActionRowBuilder().addComponents(aziendaDest),
new ActionRowBuilder().addComponents(carico)
);

await interaction.showModal(modal);

}

/* ----------- MAGAZZINO BOTTONI ----------- */

if(interaction.customId.startsWith("piu_")){

const prodotto = interaction.customId.split("_")[1];

if(magazzino[prodotto].count < magazzino[prodotto].max){
magazzino[prodotto].count++;
}

}

if(interaction.customId.startsWith("meno_")){

const prodotto = interaction.customId.split("_")[1];

if(magazzino[prodotto].count > 0){
magazzino[prodotto].count--;
}

}

if(interaction.customId === "modifica_magazzino"){

const modal = new ModalBuilder()
.setCustomId("modifica_magazzino_modal")
.setTitle("Modifica Magazzino");

const titolo = new TextInputBuilder()
.setCustomId("titolo")
.setLabel("Titolo")
.setStyle(TextInputStyle.Short)
.setValue(titoloMagazzino);

const descrizione = new TextInputBuilder()
.setCustomId("descrizione")
.setLabel("Contenuto")
.setStyle(TextInputStyle.Paragraph)
.setValue(descrizioneMagazzino);

modal.addComponents(
new ActionRowBuilder().addComponents(titolo),
new ActionRowBuilder().addComponents(descrizione)
);

await interaction.showModal(modal);

return;

}

if(messaggioMagazzino){

await messaggioMagazzino.edit({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino()
});

}

await interaction.deferUpdate();

}

/* ---------------- MODAL ---------------- */

if (interaction.isModalSubmit()) {

/* ----------- CREA MAGAZZINO ----------- */

if(interaction.customId === "crea_magazzino"){

magazzino = {};

const righe = interaction.fields.getTextInputValue("prodotti").split("\n");

for(const riga of righe){

const [nome,max] = riga.split(":");

magazzino[nome.trim()] = {
count:0,
max:parseInt(max)
};

}

messaggioMagazzino = await interaction.reply({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino(),
fetchReply:true
});

}

/* ----------- MODIFICA MAGAZZINO ----------- */

if(interaction.customId === "modifica_magazzino_modal"){

titoloMagazzino = interaction.fields.getTextInputValue("titolo");
descrizioneMagazzino = interaction.fields.getTextInputValue("descrizione");

await messaggioMagazzino.edit({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino()
});

await interaction.reply({
content:"Magazzino aggiornato",
ephemeral:true
});

}

/* ----------- CREA VIAGGIO ----------- */

if (interaction.customId === "modal_viaggio") {

const partenza = interaction.fields.getTextInputValue("partenza");
const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
const destinazione = interaction.fields.getTextInputValue("destinazione");
const aziendaDest = interaction.fields.getTextInputValue("azienda_destinazione");
const carico = interaction.fields.getTextInputValue("carico");

const embed = new EmbedBuilder()

.setTitle("🚚 DOCUMENTO DI TRASPORTO")

.setColor("Red")

.setDescription("━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

.addFields(

{
name:"👨‍✈️ AUTISTA",
value:`${interaction.user}`,
inline:false
},

{
name:"📍 PARTENZA",
value:`${partenza}\n${aziendaPartenza}`,
inline:true
},

{
name:"🏁 DESTINAZIONE",
value:`${destinazione}\n${aziendaDest}`,
inline:true
},

{
name:"📦 CARICO",
value:carico,
inline:false
},

{
name:"📊 STATO",
value:"🟥 In corso",
inline:false
}

)

.setTimestamp();

const consegna = new ButtonBuilder()
.setCustomId(`consegna_${interaction.user.id}`)
.setLabel("Segna consegna")
.setStyle(ButtonStyle.Primary);

await interaction.reply({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(consegna)]
});

await inviaPulsanteViaggio(interaction.channel);

}

}

});

client.login(process.env.TOKEN);