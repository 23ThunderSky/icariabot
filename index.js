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
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

let ultimoMessaggioCreaViaggio = null;
let magazzino = {};

client.once("ready",()=>{
console.log(`Bot online come ${client.user.tag}`);
});

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
content:"🚚 Sistema Creazione Viaggi",
components:[row]
});

ultimoMessaggioCreaViaggio = msg.id;

}

client.on("messageCreate", async message=>{

if(message.author.bot) return;

if(message.content === "!ping"){
message.reply("🏓 Pong!");
}

if(message.content === "!viaggio"){
inviaPulsanteViaggio(message.channel);
}

if(message.content.startsWith("!magazzino")){

magazzino = {
latte:{count:0,max:10}
};

const embed = new EmbedBuilder()
.setTitle("📦 MAGAZZINO")
.setColor("Blue")
.setDescription("Gestione prodotti");

const fields = [];

for(const prodotto in magazzino){

fields.push({
name:`${prodotto}`,
value:`${magazzino[prodotto].count} / ${magazzino[prodotto].max}`,
inline:false
});

}

embed.addFields(fields);

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("meno_latte")
.setLabel("➖")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("piu_latte")
.setLabel("➕")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("latte_consegnato")
.setLabel("Latte consegnato")
.setStyle(ButtonStyle.Success)

);

message.channel.send({
embeds:[embed],
components:[row]
});

}

});

client.on("interactionCreate", async interaction=>{

if(interaction.isButton()){

if(interaction.customId === "piu_latte"){

if(magazzino.latte.count < magazzino.latte.max){
magazzino.latte.count++;
}

}

if(interaction.customId === "meno_latte"){

if(magazzino.latte.count > 0){
magazzino.latte.count--;
}

}

if(interaction.customId === "latte_consegnato"){

let countdown = 10;

await interaction.reply({
content:`⏳ Latte in consegna... ${countdown}s`,
ephemeral:true
});

const interval = setInterval(async()=>{

countdown--;

if(countdown <= 0){

clearInterval(interval);

if(magazzino.latte.count < magazzino.latte.max){
magazzino.latte.count++;
}

}else{

try{
await interaction.editReply({
content:`⏳ Latte in consegna... ${countdown}s`
});
}catch{}

}

},1000);

return;

}

if(interaction.customId.startsWith("consegna_")){

const autista = interaction.customId.split("_")[1];

if(interaction.user.id !== autista){

return interaction.reply({
content:"Solo l'autista può consegnare.",
ephemeral:true
});

}

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Yellow");

embed.data.fields[5] = {
name:"📊 STATO VIAGGIO",
value:"🟨 Consegnato - Magazzino da aggiornare",
inline:false
};

const button = new ButtonBuilder()
.setCustomId("magazzino_update")
.setLabel("Magazzino aggiornato")
.setStyle(ButtonStyle.Secondary);

await interaction.update({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(button)]
});

return;

}

if(interaction.customId === "magazzino_update"){

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Green");

embed.data.fields[5] = {
name:"📊 STATO VIAGGIO",
value:"🟩 Documento registrato",
inline:false
};

await interaction.update({
embeds:[embed],
components:[]
});

return;

}

const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.data.fields = [];

for(const prodotto in magazzino){

embed.data.fields.push({
name:prodotto,
value:`${magazzino[prodotto].count} / ${magazzino[prodotto].max}`,
inline:false
});

}

await interaction.update({
embeds:[embed]
});

}

if(interaction.isModalSubmit()){

if(interaction.customId === "modal_viaggio"){

const partenza = interaction.fields.getTextInputValue("partenza");
const aziendaPartenza = interaction.fields.getTextInputValue("azienda_partenza");
const destinazione = interaction.fields.getTextInputValue("destinazione");
const aziendaDest = interaction.fields.getTextInputValue("azienda_destinazione");
const carico = interaction.fields.getTextInputValue("carico");

const embed = new EmbedBuilder()

.setTitle("🚚 DOCUMENTO DI TRASPORTO")

.setColor("Red")

.setDescription("━━━━━━━━━━━━━━━━━━━━")

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
name:"━━━━━━━━━━━━━━━━━━━━",
value:" ",
inline:false
},

{
name:"📊 STATO VIAGGIO",
value:"🟥 In corso",
inline:false
}

)

.setTimestamp();

const button = new ButtonBuilder()
.setCustomId(`consegna_${interaction.user.id}`)
.setLabel("Segna consegna")
.setStyle(ButtonStyle.Primary);

await interaction.reply({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(button)]
});

await inviaPulsanteViaggio(interaction.channel);

}

}

});

client.login(process.env.TOKEN);