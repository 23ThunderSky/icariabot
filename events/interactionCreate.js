import {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
EmbedBuilder
} from "discord.js";

export default async function(interaction){

/* BOTTONI */

if(interaction.isButton()){

/* MODIFICA MAGAZZINO */

if(interaction.customId === "mag_modifica"){

const embed = interaction.message.embeds[0];

const modal = new ModalBuilder()
.setCustomId("modal_modifica_magazzino")
.setTitle("Modifica Magazzino");

const titolo = new TextInputBuilder()
.setCustomId("titolo")
.setLabel("Titolo")
.setStyle(TextInputStyle.Short)
.setValue(embed.title ?? "")
.setRequired(true);

const contenuto = new TextInputBuilder()
.setCustomId("contenuto")
.setLabel("Contenuto")
.setStyle(TextInputStyle.Paragraph)
.setValue(embed.description ?? "")
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(titolo),
new ActionRowBuilder().addComponents(contenuto)
);

return interaction.showModal(modal);

}

/* BOTTONI MAGAZZINO + - */

if(interaction.customId.startsWith("mag_")){

const embed = EmbedBuilder.from(interaction.message.embeds[0]);
let lines = embed.data.description.split("\n");

const parts = interaction.customId.split("_");
const type = parts[1];
const prodotto = parts.slice(2).join("_");

lines = lines.map(line => {

if(!line.includes(`**${prodotto}**`)) return line;

const data = line.split(": ")[1];
let [num,max] = data.split(" / ").map(n => parseInt(n));

if(type === "plus") num = Math.min(max, num + 1);
if(type === "minus") num = Math.max(0, num - 1);

return `**${prodotto}**: ${num} / ${max}`;

});

embed.setDescription(lines.join("\n"));

return interaction.update({
embeds:[embed]
});

}

/* CREA VIAGGIO */

if(interaction.customId === "crea_viaggio"){

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

modal.addComponents(
new ActionRowBuilder().addComponents(partenza),
new ActionRowBuilder().addComponents(aziendaPartenza),
new ActionRowBuilder().addComponents(destinazione),
new ActionRowBuilder().addComponents(aziendaDest),
new ActionRowBuilder().addComponents(carico)
);

await interaction.showModal(modal);

}

/* SEGNA CONSEGNA */

if(interaction.customId.startsWith("consegna_")){

const autista = interaction.customId.split("_")[1];

if(interaction.user.id !== autista){

return interaction.reply({
content:"Solo l'autista può confermare la consegna.",
ephemeral:true
});

}

const embed = EmbedBuilder.from(interaction.message.embeds[0]);
embed.setColor("Yellow");

const fields = embed.data.fields;

fields[4] = {
name:"📊 STATO",
value:"🟨 Consegnato - Magazzino da aggiornare"
};

embed.setFields(fields);

const aggiorna = new ButtonBuilder()
.setCustomId("magazzino_update")
.setLabel("Magazzino aggiornato")
.setStyle(ButtonStyle.Secondary);

await interaction.update({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(aggiorna)]
});

}

/* MAGAZZINO AGGIORNATO */

if(interaction.customId === "magazzino_update"){

const embed = EmbedBuilder.from(interaction.message.embeds[0]);
embed.setColor("Green");

const fields = embed.data.fields;

fields[4] = {
name:"📊 STATO",
value:"🟩 Documento registrato"
};

embed.setFields(fields);

await interaction.update({
embeds:[embed],
components:[]
});

}

}

/* MODAL */

if(interaction.isModalSubmit()){

/* MODIFICA MAGAZZINO */

if(interaction.customId === "modal_modifica_magazzino"){

const titolo = interaction.fields.getTextInputValue("titolo");
const contenuto = interaction.fields.getTextInputValue("contenuto");

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.setTitle(titolo);
embed.setDescription(contenuto);

return interaction.update({
embeds:[embed]
});

}

/* CREAZIONE VIAGGIO */

if(interaction.customId==="modal_viaggio"){

const partenza = interaction.fields.getTextInputValue("partenza");
const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
const destinazione = interaction.fields.getTextInputValue("destinazione");
const aziendaDest = interaction.fields.getTextInputValue("azienda_destinazione");
const carico = interaction.fields.getTextInputValue("carico");

const embed = new EmbedBuilder()
.setTitle("🚚 DOCUMENTO DI TRASPORTO")
.setColor("Red")
.addFields(
{name:"👨‍✈️ AUTISTA",value:`${interaction.user}`},
{name:"📍 PARTENZA",value:`${partenza}\n${aziendaPartenza}`,inline:true},
{name:"🏁 DESTINAZIONE",value:`${destinazione}\n${aziendaDest}`,inline:true},
{name:"📦 CARICO",value:carico},
{name:"📊 STATO",value:"🟥 In corso"}
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

/* ricrea pulsante CREA VIAGGIO */

const channel = interaction.channel;

const messages = await channel.messages.fetch({limit:20});

const old = messages.find(m =>
m.author.id === interaction.client.user.id &&
m.components.length > 0 &&
m.components[0].components[0].customId === "crea_viaggio"
);

if(old){
try{ await old.delete(); }catch{}
}

const crea = new ButtonBuilder()
.setCustomId("crea_viaggio")
.setLabel("Crea Viaggio")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(crea);

await channel.send({
content:"🚚 **Sistema Creazione Viaggi**",
components:[row]
});

}

}

}