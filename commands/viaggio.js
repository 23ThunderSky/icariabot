export default {

name:"viaggio",

async execute(message,client){

const channel = message.channel;

/* cancella vecchio pulsante */

const messages = await channel.messages.fetch({limit:20});

const old = messages.find(m =>
m.author.id === client.user.id &&
m.components.length > 0 &&
m.components[0].components[0].customId === "crea_viaggio"
);

if(old){
try{ await old.delete(); }catch{}
}

/* crea nuovo pulsante */

const {ActionRowBuilder,ButtonBuilder,ButtonStyle} = await import("discord.js");

const button = new ButtonBuilder()
.setCustomId("crea_viaggio")
.setLabel("Crea Viaggio")
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(button);

await channel.send({
content:"🚚 **Sistema Creazione Viaggi**",
components:[row]
});

}

}