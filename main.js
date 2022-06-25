const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_BANS,
    ],
});

client.commands = new Collection();
const c = [];
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    c.push(command.data);
}

const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	}
    else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    console.log('Ready!');

    try {
		console.log('Started refreshing application (/) commands.');

        // node dev env
        if (process.env.NODE_ENV === 'devel') {
            console.log('Running in development mode. Commands are guild-wide.');

            client.guilds.cache.map(g => {
                rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, g.id), { body: c })
                    .then(() => console.log(`Successfully registered ${c.length} application commands for ${client.guilds.cache.size} guilds.`))
                    .catch(console.error);
            });
        }
        else {
            console.log('Running in production mode. Commands are bot-wide.');
            rest.put(Routes.applicationCommands(process.env.CLIENTID), { body: c })
                .then(() => console.log(`Successfully registered ${c.length} application commands.`))
                .catch(console.error);
        }

        console.log(`Successfully reloaded ${c.length} application (/) commands.`);
	}
    catch (error) {
		console.error(error);
    }
});

client.login(process.env.TOKEN);

client.on('error', console.error);