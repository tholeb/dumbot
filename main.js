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

client.logger = require('./src/utils/Logger');
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
    client.logger.info(`${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`);
    client.logger.info(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=517544070209\n`);

    client.user.setActivity({ name: 'faire un trek 🌲', type: 'PLAYING', url: 'https://www.youtube.com/watch?v=_qbx8IV7Yts' });

    try {
        // node dev env
        if (process.env.NODE_ENV === 'development') {
            client.logger.info('Running in development mode. Commands are guild-wide.');

            client.guilds.cache.map(g => {
                rest.put(Routes.applicationGuildCommands(client.user.id, g.id), { body: c })
                    .then(() => client.logger.info(`Successfully registered ${c.length} application commands for ${client.guilds.cache.size} guilds.`))
                    .catch(client.logger.error);
                rest.put(Routes.applicationCommands(client.user.id), { body: [] })
                    .catch(client.logger.error);
            });
        }
        else {
            client.logger.info('Running in production mode. Commands are bot-wide.');
            rest.put(Routes.applicationCommands(client.user.id), { body: c })
                .then(() => client.logger.info(`Successfully registered ${c.length} application commands.`))
                .catch(client.logger.error);
        }

        client.logger.info(`Successfully reloaded ${c.length} application (/) commands.`);
	}
    catch (error) {
		client.logger.error(error);
    }
});

client.login(process.env.TOKEN);

client.on('debug', m => client.logger.debug(m));
client.on('warn', m => client.logger.warn(m));
client.on('error', m => client.logger.error(m));