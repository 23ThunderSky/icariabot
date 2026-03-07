const {
Client,
GatewayIntentBits,
REST,
Routes,
SlashCommandBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
Events,
EmbedBuilder
} = require("discord.js");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const commands = [
new SlashCommandBuilder()
.setName("crea")
.setDescription("Crea qualcosa")
].map(c => c.toJSON());

client.once("ready", async () => {

console.log("Bot online");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

await rest.put(
Routes.applicationGuildCommands(
process.env.CLIENT_ID,
process.env.GUILD_ID
),
{ body: commands }
);

console.log("Comandi registrati");

});

client.on(Events.InteractionCreate, async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "crea") {

const menu = new StringSelectMenuBuilder()
.setCustomId("menu_crea")
.setPlaceholder("Scegli cosa creare")
.addOptions([
{
label: "Magazzino",
value: "magazzino",
emoji: "📦"
},
{
label: "Treno",
value: "treno",
emoji: "🚂"
},
{
label: "Viaggio",
value: "viaggio",
emoji: "🚚"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

await interaction.reply({
content: "Seleziona cosa vuoi creare:",
components: [row]
});

}

}

if (interaction.isStringSelectMenu()) {

const scelta = interaction.values[0];

let embed;

if (scelta === "magazzino") {

embed = new EmbedBuilder()
.setTitle("📦 Magazzino")
.setDescription("Magazzino creato")
.setColor("Green");

}

if (scelta === "treno") {

embed = new EmbedBuilder()
.setTitle("🚂 Treno")
.setDescription("Sistema treno creato")
.setColor("Blue");

}

if (scelta === "viaggio") {

embed = new EmbedBuilder()
.setTitle("🚚 Viaggio")
.setDescription("Sistema viaggio creato")
.setColor("Orange");

}

await interaction.update({
embeds: [embed],
components: []
});

}

});

client.login(process.env.TOKEN);