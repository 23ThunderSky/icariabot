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

let ultimoMessaggioCreaViaggio=null;

let magazzino={}
let titoloMagazzino="📦 Magazzino"
let descrizioneMagazzino=""

let messaggioMagazzino=null

client.once("ready",()=>{
console.log(`Bot online come ${client.user.tag}`)
})

function generaEmbedMagazzino(){

const embed=new EmbedBuilder()
.setTitle(titoloMagazzino)
.setDescription(descrizioneMagazzino)
.setColor("Blue")

const fields=[]

for(const prodotto in magazzino){

fields.push({
name:prodotto,
value:`${magazzino[prodotto].count} / ${magazzino[prodotto].max}`,
inline:true
})

}

embed.addFields(fields)

return embed

}

function generaBottoniMagazzino(){

const rows=[]

for(const prodotto in magazzino){

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId(`meno_${prodotto}`)
.setLabel(`➖ ${prodotto}`)
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId(`piu_${prodotto}`)
.setLabel(`➕ ${prodotto}`)
.setStyle(ButtonStyle.Secondary)

)

rows.push(row)

}

const extra=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("latte_consegnato")
.setLabel("🥛 Latte consegnato")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("modifica_magazzino")
.setLabel("Modifica Magazzino")
.setStyle(ButtonStyle.Primary)

)

rows.push(extra)

return rows

}

client.on("messageCreate",async message=>{

if(message.author.bot) return

if(message.content==="!ping"){
message.reply("🏓 Pong!")
}

if(message.content==="!magazzino"){

const modal=new ModalBuilder()
.setCustomId("crea_magazzino")
.setTitle("Crea Magazzino")

const prodotti=new TextInputBuilder()
.setCustomId("prodotti")
.setLabel("Prodotti (esempio: Latte:10)")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true)

modal.addComponents(
new ActionRowBuilder().addComponents(prodotti)
)

await message.channel.send("Apri il modal per creare il magazzino")

}

})

client.on("interactionCreate",async interaction=>{

if(interaction.isButton()){

const id=interaction.customId

if(id.startsWith("piu_")){

const prodotto=id.split("_")[1]

if(magazzino[prodotto].count < magazzino[prodotto].max){
magazzino[prodotto].count++
}

}

if(id.startsWith("meno_")){

const prodotto=id.split("_")[1]

if(magazzino[prodotto].count > 0){
magazzino[prodotto].count--
}

}

if(id==="latte_consegnato"){

let countdown=10

await interaction.reply({
content:`🥛 Latte consegnato tra ${countdown}s`,
ephemeral:true
})

const interval=setInterval(async()=>{

countdown--

if(countdown<=0){

clearInterval(interval)

if(magazzino["Latte"] && magazzino["Latte"].count < magazzino["Latte"].max){
magazzino["Latte"].count++
}

await messaggioMagazzino.edit({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino()
})

await interaction.editReply({
content:"✅ Latte consegnato!"
})

}else{

await interaction.editReply({
content:`🥛 Latte consegnato tra ${countdown}s`
})

}

},1000)

return

}

if(id==="modifica_magazzino"){

const modal=new ModalBuilder()
.setCustomId("modifica_magazzino_modal")
.setTitle("Modifica Magazzino")

const titolo=new TextInputBuilder()
.setCustomId("titolo")
.setLabel("Titolo")
.setStyle(TextInputStyle.Short)
.setValue(titoloMagazzino)

const descrizione=new TextInputBuilder()
.setCustomId("descrizione")
.setLabel("Descrizione")
.setStyle(TextInputStyle.Paragraph)
.setValue(descrizioneMagazzino)

modal.addComponents(
new ActionRowBuilder().addComponents(titolo),
new ActionRowBuilder().addComponents(descrizione)
)

await interaction.showModal(modal)

return

}

await messaggioMagazzino.edit({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino()
})

await interaction.deferUpdate()

}

if(interaction.isModalSubmit()){

if(interaction.customId==="crea_magazzino"){

magazzino={}

const righe=interaction.fields.getTextInputValue("prodotti").split("\n")

for(const riga of righe){

const [nome,max]=riga.split(":")

magazzino[nome.trim()]={
count:0,
max:parseInt(max)
}

}

const embed=generaEmbedMagazzino()

messaggioMagazzino=await interaction.reply({
embeds:[embed],
components:generaBottoniMagazzino(),
fetchReply:true
})

}

if(interaction.customId==="modifica_magazzino_modal"){

titoloMagazzino=interaction.fields.getTextInputValue("titolo")
descrizioneMagazzino=interaction.fields.getTextInputValue("descrizione")

await messaggioMagazzino.edit({
embeds:[generaEmbedMagazzino()],
components:generaBottoniMagazzino()
})

await interaction.reply({
content:"Magazzino aggiornato",
ephemeral:true
})

}

}

})

client.login(process.env.TOKEN)