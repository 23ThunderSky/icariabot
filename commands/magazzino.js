import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export default {

name: "magazzino",

async execute(message){

const prodotti = message.content.split(" ").slice(1);

if(prodotti.length === 0){
return message.reply("Scrivi i prodotti dopo !magazzino");
}

if(prodotti.length > 5){
return message.reply("Massimo 5 prodotti.");
}

let descrizione = "";

const rows = [];

for(const p of prodotti){

const nome = p.toLowerCase();

descrizione += `**${nome}**: 0\n`;

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