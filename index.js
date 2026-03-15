import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

client.commands = new Map();

/* carica comandi */

const commandFiles = fs.readdirSync("./commands");

for(const file of commandFiles){

const command = await import(`./commands/${file}`);

client.commands.set(command.default.name, command.default);

}

/* messageCreate */

client.on("messageCreate", async message => {

if(message.author.bot) return;

if(!message.content.startsWith("!")) return;

const args = message.content.slice(1).split(" ");
const cmd = args.shift().toLowerCase();

const command = client.commands.get(cmd);

if(command){
command.execute(message,client);
}

});

/* events */

import interactionEvent from "./events/interactionCreate.js";

client.on("interactionCreate",(interaction)=>{
interactionEvent(interaction,client);
});

client.once("ready",()=>{
console.log(`Bot online come ${client.user.tag}`);
});

client.login(process.env.TOKEN);