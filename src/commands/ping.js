const { MessageEmbed } = require('discord.js');

module.exports = {
	data: {
		name: 'ping',
		description: 'Pong!',
	},
    async execute(client, interaction) {
        const ping = new MessageEmbed()
		.setColor('RANDOM')
		.setTimestamp()
		.setTitle('🏓╎ Pong!')
		.setDescription(`🏠╎Websocket Latency: ${client.ws.ping}ms\n🤖╎Bot Latency: ${Date.now() - interaction.createdTimestamp}ms`);

		return interaction.reply({ embeds: [ping] });

	},
};