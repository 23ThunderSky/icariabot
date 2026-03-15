import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export default {

name: "magazzino",

async execute(message){

const prodotti = message.content
.replace("!magazzino","")
.split(",")
.map(p => p.trim())
.filter(p => p.length > 0);

if(prodotti.length === 0){
return message.reply("Usa: !magazzino prodotto:max, prodotto:max");
}

if(prodotti.length > 5){
return message.reply("Massimo 5 prodotti.");
}

let descrizione = "";
const rows = [];

for(const p of prodotti){

const parts = p.split(":");

const nome = parts[0].toLowerCase();
const max = parseInt(parts[1]) || 100;

descrizione += `**${nome}**: 0 / ${max}\n`;

const plus = new ButtonBuilder()
.setCustomId(`mag_plus_${nome}`)
.setLabel(`➕ ${nome}`)
.setStyle(ButtonStyle.Success);

const minus = new ButtonBuilder()
.setCustomId(`mag_minus_${nome}`)
.setLabel(`➖ ${nome}`)
.setStyle(ButtonStyle.Danger);

rows.push(
new ActionRowBuilder().addComponents(plus,minus)
);

}

/* pulsante modifica */

const modifica = new ButtonBuilder()
.setCustomId("mag_modifica")
.setLabel("✏️ Modifica")
.setStyle(ButtonStyle.Secondary);

rows.push(
new ActionRowBuilder().addComponents(modifica)
);

const embed = new EmbedBuilder()
.setTitle("📦 MAGAZZINO")
.setColor("Blue")
.setDescription(descrizione);

await message.channel.send({
embeds:[embed],
components:rows
});

}

};