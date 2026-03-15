import {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

let ultimoMessaggioCreaViaggio = null;

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

export default {

name:"viaggio",

async execute(message){

await inviaPulsanteViaggio(message.channel);

}

};

export {inviaPulsanteViaggio};