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

}

}

}