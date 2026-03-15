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

let magazzino = {
latte:{count:0,max:10},
pane:{count:0,max:10}
};

let titoloMagazzino = "📦 MAGAZZINO";
let descrizioneMagazzino = "Gestione prodotti";

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

function generaEmbedMagazzino(){

const embed = new EmbedBuilder()
.setTitle(titoloMagazzino)
.setDescription(descrizioneMagazzino)
.setColor("Blue");

const fields=[];

for(const prodotto in magazzino){

fields.push({
name:prodotto,
value:`${magazzino[prodotto].count} / ${magazzino[prodotto].max}`,
inline:true
});

}

embed.addFields(fields);

return embed;

}

function generaPulsantiMagazzino(){

const rows=[];

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

const extra = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("latte_consegnato")
.setLabel("🥛 Latte consegnato")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("modifica_magazzino")
.setLabel("Modifica Magazzino")
.setStyle(ButtonStyle.Primary)

);

rows.push(extra);

return rows;

}

client.on("messageCreate", async message=>{

if(message.author.bot) return;

if(message.content === "!ping"){
message.reply("🏓 Pong!");
}

if(message.content === "!viaggio"){
inviaPulsanteViaggio(message.channel);
}

if(message.content === "!magazzino"){

const embed = generaEmbedMagazzino();
const rows = generaPulsantiMagazzino();

message.channel.send({
embeds:[embed],
components:rows
});

}

});

client.on("interactionCreate", async interaction=>{

if(interaction.isButton()){

const id = interaction.customId;

if(id.startsWith("piu_")){

const prodotto=id.split("_")[1];

if(magazzino[prodotto].count < magazzino[prodotto].max){
magazzino[prodotto].count++;
}

}

if(id.startsWith("meno_")){

const prodotto=id.split("_")[1];

if(magazzino[prodotto].count > 0){
magazzino[prodotto].count--;
}

}

if(id === "latte_consegnato"){

let countdown=10;

await interaction.reply({
content:`🥛 Latte in arrivo... ${countdown}s`,
ephemeral:true
});

const timer=setInterval(async()=>{

countdown--;

if(countdown<=0){

clearInterval(timer);

if(magazzino.latte.count < magazzino.latte.max){
magazzino.latte.count++;
}

try{
await interaction.editReply({
content:"✅ Latte consegnato!"
});
}catch{}

}else{

try{
await interaction.editReply({
content:`🥛 Latte in arrivo... ${countdown}s`
});
}catch{}

}

},1000);

return;

}

if(id === "modifica_magazzino"){

const modal=new ModalBuilder()
.setCustomId("modal_magazzino")
.setTitle("Modifica Magazzino");

const titolo=new TextInputBuilder()
.setCustomId("titolo")
.setLabel("Titolo")
.setStyle(TextInputStyle.Short)
.setValue(titoloMagazzino);

const descrizione=new TextInputBuilder()
.setCustomId("descrizione")
.setLabel("Descrizione")
.setStyle(TextInputStyle.Paragraph)
.setValue(descrizioneMagazzino);

modal.addComponents(
new ActionRowBuilder().addComponents(titolo),
new ActionRowBuilder().addComponents(descrizione)
);

await interaction.showModal(modal);

return;

}

if(id.startsWith("consegna_")){

const autista=id.split("_")[1];

if(interaction.user.id !== autista){

return interaction.reply({
content:"Solo l'autista può consegnare.",
ephemeral:true
});

}

const embed=EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Yellow");

embed.data.fields[5]={
name:"📊 STATO VIAGGIO",
value:"🟨 Consegnato - Magazzino da aggiornare",
inline:false
};

const button=new ButtonBuilder()
.setCustomId("magazzino_update")
.setLabel("Magazzino aggiornato")
.setStyle(ButtonStyle.Secondary);

await interaction.update({
embeds:[embed],
components:[new ActionRowBuilder().addComponents(button)]
});

return;

}

if(id === "magazzino_update"){

const embed=EmbedBuilder.from(interaction.message.embeds[0]);

embed.setColor("Green");

embed.data.fields[5]={
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

const embed=generaEmbedMagazzino();

await interaction.update({
embeds:[embed],
components:generaPulsantiMagazzino()
});

}

if(interaction.isModalSubmit()){

if(interaction.customId === "modal_magazzino"){

titoloMagazzino=interaction.fields.getTextInputValue("titolo");
descrizioneMagazzino=interaction.fields.getTextInputValue("descrizione");

await interaction.reply({
content:"✅ Magazzino aggiornato",
ephemeral:true
});

}

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

const button=new ButtonBuilder()
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